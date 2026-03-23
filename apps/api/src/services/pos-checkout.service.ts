import { and, eq, inArray } from "drizzle-orm";
import {
  posOrders,
  posOrderLines,
  stockMoves,
  journalEntries,
  journalItems,
  accounts,
  products,
  boms
} from "@warung-bujo/database";
import { CheckoutInput } from "./types";
import { InsufficientStockError } from "../errors";
import { createJournalEntry, JournalLine } from "../utils/journal";
import { insertStockMoves, getStockBalances } from "../utils/stock";

interface Product {
  id: string;
  name: string;
  price: string;
  purchasePrice: string;
  categoryId: string | null;
  isSellable: boolean;
  isRawMaterial: boolean;
  unit: string;
}

/**
 * processPosCheckout
 * Refactored for Zero N+1 Queries and Batched inserts.
 */
export async function processPosCheckout(db: any, input: CheckoutInput) {
  // Semua operasi berada dalam Single Transaction
  return await db.transaction(async (tx: any) => {
    console.time("Checkout Process");
    
    // ------------------------------------------------------------------------
    // FASE 1: BATCH PRODUCT FETCH
    // ------------------------------------------------------------------------
    console.time("Fetch Products");
    const productIds = input.lines.map((l) => l.productId);
    const dbProducts = await tx
      .select()
      .from(products)
      .where(inArray(products.id, productIds)) as Product[];

    // Gunakan map O(1) akses agar tidak re-query
    const productMap = new Map<string, Product>(dbProducts.map((p) => [p.id, p]));
    console.timeEnd("Fetch Products");

    // ------------------------------------------------------------------------
    // FASE 2: BATCH BOM LOOKUP (Mengeliminasi N+1 BOM lookup)
    // ------------------------------------------------------------------------
    console.time("Fetch BOMs");
    const productBoms = await tx
      .select({
        productId: boms.productId,
        rawMaterialId: boms.rawMaterialId,
        qtyRequired: boms.qtyRequired,
        rawMaterialName: products.name,           // Nama bahan untuk error reponse
        rawMaterialUnit: products.unit,
        rawMaterialPrice: products.purchasePrice, // HPP dari raw material
      })
      .from(boms)
      .innerJoin(products, eq(boms.rawMaterialId, products.id))
      .where(inArray(boms.productId, productIds));

    // Kelompokkan ingredients per final productId
    const bomMap = new Map<string, typeof productBoms>();
    for (const b of productBoms) {
      const existing = bomMap.get(b.productId) || [];
      existing.push(b);
      bomMap.set(b.productId, existing);
    }
    console.timeEnd("Fetch BOMs");

    // ------------------------------------------------------------------------
    // FASE 3: KALKULASI KEBUTUHAN STOK (In-memory, 0 Query O(N))
    // ------------------------------------------------------------------------
    console.time("Calculate Needs");
    const stockRequirements = new Map<string, {
      qty: number;
      name: string;
      unit: string;
      usedBy: string[];
    }>();

    let totalAmount = 0;
    let totalCOGS = 0;

    const orderLinesData = input.lines.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      const subtotal = Number(product.price) * item.qty;
      totalAmount += subtotal;

      const ingredients = bomMap.get(item.productId);
      if (ingredients && ingredients.length > 0) {
        // Produk ber-BOM (contoh Teh Manis -> Teh, Gula)
        for (const ing of ingredients) {
          const neededQty = Number(ing.qtyRequired) * item.qty;
          const ingredientCost = Number(ing.rawMaterialPrice) * neededQty;
          totalCOGS += ingredientCost;

          const req = stockRequirements.get(ing.rawMaterialId);
          if (req) {
            req.qty += neededQty;
            if (!req.usedBy.includes(product.name)) req.usedBy.push(product.name);
          } else {
            stockRequirements.set(ing.rawMaterialId, {
              qty: neededQty,
              name: ing.rawMaterialName,
              unit: ing.rawMaterialUnit,
              usedBy: [product.name],
            });
          }
        }
      } else {
        // Fallback Product non-BOM terjual langsung (misal snack satuan)
        const productCost = Number(product.purchasePrice) * item.qty;
        totalCOGS += productCost;

        const req = stockRequirements.get(item.productId);
        if (req) {
          req.qty += item.qty;
          if (!req.usedBy.includes(product.name)) req.usedBy.push(product.name);
        } else {
          stockRequirements.set(item.productId, {
            qty: item.qty,
            name: product.name,
            unit: product.unit,
            usedBy: [product.name],
          });
        }
      }

      return {
        productId: item.productId,
        qty: String(item.qty),
        price: product.price,
        subtotal: String(subtotal),
      };
    });

    const discount = input.discount || 0;
    const finalTotal = totalAmount - discount;
    console.timeEnd("Calculate Needs");

    // ------------------------------------------------------------------------
    // FASE 4: BATCH STOCK VALIDATION (Mengeliminasi N+1 loop pengecekan)
    // ------------------------------------------------------------------------
    console.time("Validate Stock");
    const requiredMaterialIds = Array.from(stockRequirements.keys());
    // Panggil helper yang hanya jalankan 1x Query Agregasi Stock!
    const stockBalances = await getStockBalances(tx, input.branchId, requiredMaterialIds);

    const shortages = [];
    for (const [materialId, req] of stockRequirements.entries()) {
      const currentStock = stockBalances.get(materialId) || 0;
      if (currentStock < req.qty) {
        shortages.push({
          productId: materialId,
          productName: req.name,
          required: req.qty,
          available: currentStock,
          shortage: req.qty - currentStock,
          unit: req.unit,
          usedBy: req.usedBy,
        });
      }
    }

    // Roleback transaction otomatis by throwing error secara spesifik dan terbaca kasir
    if (shortages.length > 0) {
      console.timeEnd("Validate Stock");
      console.timeEnd("Checkout Process");
      
      throw new InsufficientStockError(shortages);
    }
    console.timeEnd("Validate Stock");

    // ------------------------------------------------------------------------
    // FASE 5: BATCH INSERT TRANSACTION
    // ------------------------------------------------------------------------
    console.time("Insert Transaction");
    
    // Insert order awal
    const [insertedOrder] = await tx
      .insert(posOrders)
      .values({
        branchId: input.branchId,
        userId: input.userId,
        partnerId: input.partnerId,
        orderType: input.orderType,
        status: "Paid",
        total: String(finalTotal),
        discount: String(discount),
        paymentMethod: input.paymentMethod,
      })
      .returning();

    // Prepare arrays
    // ✅ P2: Menggunakan insertStockMoves helper
    const stockMoveInputs = [];
    for (const [materialId, req] of stockRequirements.entries()) {
      stockMoveInputs.push({
        branchId: input.branchId,
        productId: materialId,
        qty: -req.qty, // NEGATIF (pengurangan stok)
        referenceType: "pos_sale" as const,
        referenceId: insertedOrder.id,
        notes: `Penjualan POS Order ${insertedOrder.id}`,
      });
    }
    await insertStockMoves(tx, stockMoveInputs);

    // Eksekusi Batch
    if (orderLinesData.length > 0) {
      // 1 Query
      await tx.insert(posOrderLines).values(
        orderLinesData.map((line) => ({
          ...line,
          orderId: insertedOrder.id,
        }))
      );
    }

    if (stockMoveInputs.length > 0) {
      // 1 Query (Mengeliminasi N+1 query loop insert!)
      await tx.insert(stockMoves).values(stockMoveInputs);
    }
    console.timeEnd("Insert Transaction");

    // ------------------------------------------------------------------------
    // FASE 6: ACCOUNTING BATCH INSERT
    // ------------------------------------------------------------------------
    console.time("Accounting Records");
    // ✅ P2: Menggunakan utils/journal
    const journalLines: JournalLine[] = [
      { accountCode: "1101", debit: finalTotal, credit: 0 },
      { accountCode: "4101", debit: 0, credit: finalTotal },
      { accountCode: "5101", debit: totalCOGS, credit: 0 },
      { accountCode: "1401", debit: 0, credit: totalCOGS },
    ];
    const journalEntry = await createJournalEntry(tx, insertedOrder.id, `Sales ${insertedOrder.id}`, journalLines);
    console.timeEnd("Accounting Records");
    console.timeEnd("Checkout Process");

    return {
      orderId: insertedOrder.id,
      journalEntryId: journalEntry,
      total: finalTotal,
      cogs: totalCOGS,
    };
  });
}

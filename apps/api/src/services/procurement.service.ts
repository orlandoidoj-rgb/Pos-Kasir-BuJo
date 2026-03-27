import { insertStockMoves, StockMoveInput } from "../utils/stock";
import { createJournalEntry, JournalLine } from "../utils/journal";
import { eq, and, inArray } from "drizzle-orm";
import {
  purchaseOrders,
  purchaseOrderLines,
  partners,
  branches,
  products,
} from "@warung-bujo/database";

export interface PurchaseLineInput {
  productId: string;
  qty: number;
  unitPrice: number;
}

export interface PurchaseInput {
  supplierId?: string;
  branchId: string;
  notes?: string;
  lines: PurchaseLineInput[];
}

/**
 * getPurchaseOrders
 * Mengambil list purchase orders dengan filter status dan opsional branch
 */
export async function getPurchaseOrders(
  db: any,
  statuses?: string[],
  branchId?: string
) {
  const query = db
    .select({
      id: purchaseOrders.id,
      poNumber: purchaseOrders.poNumber,
      supplierId: purchaseOrders.supplierId,
      supplierName: partners.name,
      branchId: purchaseOrders.branchId,
      branchName: branches.name,
      status: purchaseOrders.status,
      totalAmount: purchaseOrders.totalAmount,
      notes: purchaseOrders.notes,
      createdAt: purchaseOrders.createdAt,
      receivedAt: purchaseOrders.receivedAt,
    })
    .from(purchaseOrders)
    .leftJoin(partners, eq(purchaseOrders.supplierId, partners.id))
    .leftJoin(branches, eq(purchaseOrders.branchId, branches.id));

  const conditions = [];

  if (statuses && statuses.length > 0) {
    conditions.push(inArray(purchaseOrders.status, statuses));
  }

  if (branchId) {
    conditions.push(eq(purchaseOrders.branchId, branchId));
  }

  if (conditions.length > 0) {
    query.where(and(...conditions));
  }

  return await query.orderBy(purchaseOrders.createdAt);
}

/**
 * getPurchaseOrderById
 * Mengambil detail PO dengan semua lines-nya
 */
export async function getPurchaseOrderById(db: any, id: string) {
  // Get PO header
  const poList = await db
    .select({
      id: purchaseOrders.id,
      poNumber: purchaseOrders.poNumber,
      supplierId: purchaseOrders.supplierId,
      supplierName: partners.name,
      branchId: purchaseOrders.branchId,
      branchName: branches.name,
      status: purchaseOrders.status,
      totalAmount: purchaseOrders.totalAmount,
      notes: purchaseOrders.notes,
      createdAt: purchaseOrders.createdAt,
      receivedAt: purchaseOrders.receivedAt,
    })
    .from(purchaseOrders)
    .leftJoin(partners, eq(purchaseOrders.supplierId, partners.id))
    .leftJoin(branches, eq(purchaseOrders.branchId, branches.id))
    .where(eq(purchaseOrders.id, id));

  if (poList.length === 0) {
    return null;
  }

  const po = poList[0];

  // Get PO lines with product info
  const lines = await db
    .select({
      id: purchaseOrderLines.id,
      productId: purchaseOrderLines.productId,
      productName: products.name,
      productUnit: products.unit,
      qty: purchaseOrderLines.qty,
      unitPrice: purchaseOrderLines.unitPrice,
      subtotal: purchaseOrderLines.subtotal,
    })
    .from(purchaseOrderLines)
    .leftJoin(products, eq(purchaseOrderLines.productId, products.id))
    .where(eq(purchaseOrderLines.purchaseOrderId, id));

  return {
    ...po,
    lines: lines.map(l => ({
      ...l,
      qty: Number(l.qty),
      unitPrice: Number(l.unitPrice),
      subtotal: Number(l.subtotal),
      totalAmount: Number(po.totalAmount),
    })),
  };
}

/**
 * createPurchaseOrder
 * Belanja bahan baku dari supplier:
 * 1. Insert purchase_order + lines
 * 2. Create positive stock_moves (tambah stok di cabang) via insertStockMoves
 * 3. Create journal entry via createJournalEntry
 */
export async function createPurchaseOrder(db: any, input: PurchaseInput) {
  return await db.transaction(async (tx: any) => {
    const totalAmount = input.lines.reduce(
      (sum, l) => sum + l.qty * l.unitPrice,
      0
    );

    const poNumber = `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    // Insert PO header (langsung Received)
    const [po] = await tx
      .insert(purchaseOrders)
      .values({
        poNumber,
        supplierId: input.supplierId ?? null,
        branchId: input.branchId,
        status: "Received",
        totalAmount: String(totalAmount),
        notes: input.notes ?? null,
        receivedAt: new Date(),
      })
      .returning();

    // Insert PO lines
    await tx.insert(purchaseOrderLines).values(
      input.lines.map((l) => ({
        purchaseOrderId: po.id,
        productId: l.productId,
        qty: String(l.qty),
        unitPrice: String(l.unitPrice),
        subtotal: String(l.qty * l.unitPrice),
      }))
    );

    // ✅ P2: Menggunakan helper terpusat
    const moves: StockMoveInput[] = input.lines.map((line) => ({
      branchId: input.branchId,
      productId: line.productId,
      qty: Number(line.qty),
      referenceType: "purchase" as const,
      referenceId: po.id,
      notes: `Pembelian dari supplier - ${poNumber}`,
    }));
    await insertStockMoves(tx, moves);

    // ✅ P2: Menggunakan helper terpusat untuk jurnal
    // Debit:  1401 Persediaan (Inventory)
    // Credit: 2101 Hutang Usaha (AP) - atau Kas 1101 bila bayar lunas
    const lines: JournalLine[] = [
      { accountCode: "1401", debit: totalAmount, credit: 0 },
      { accountCode: "2101", debit: 0, credit: totalAmount },
    ];
    const journalEntryId = await createJournalEntry(tx, po.id, `Pembelian Bahan Baku ${poNumber}`, lines);


    return {
      poId: po.id,
      poNumber,
      totalAmount,
      journalEntryId,
    };
  });
}

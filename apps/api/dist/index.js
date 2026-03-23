"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_express = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_dotenv = __toESM(require("dotenv"));

// src/services/pos-checkout.service.ts
var import_drizzle_orm = require("drizzle-orm");
var import_database = require("@warung-bujo/database");
async function processPosCheckout(db, input) {
  return await db.transaction(async (tx) => {
    const productIds = input.lines.map((l) => l.productId);
    const dbProducts = await tx.select().from(import_database.products).where((0, import_drizzle_orm.inArray)(import_database.products.id, productIds));
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    let totalAmount = 0;
    const orderLinesData = input.lines.map((item) => {
      const product = productMap.get(item.productId);
      if (!product)
        throw new Error(`Product ${item.productId} not found`);
      const subtotal = Number(product.price) * item.qty;
      totalAmount += subtotal;
      return {
        productId: item.productId,
        qty: String(item.qty),
        price: product.price,
        subtotal: String(subtotal)
      };
    });
    const discount = input.discount || 0;
    const finalTotal = totalAmount - discount;
    const [insertedOrder] = await tx.insert(import_database.posOrders).values({
      branchId: input.branchId,
      userId: input.userId,
      partnerId: input.partnerId,
      orderType: input.orderType,
      status: "Paid",
      total: String(finalTotal),
      discount: String(discount),
      paymentMethod: input.paymentMethod
    }).returning();
    await tx.insert(import_database.posOrderLines).values(
      orderLinesData.map((line) => ({
        ...line,
        orderId: insertedOrder.id
      }))
    );
    const stockRequirements = /* @__PURE__ */ new Map();
    for (const item of input.lines) {
      const ingredients = await tx.select({
        rawMaterialId: import_database.boms.rawMaterialId,
        qtyRequired: import_database.boms.qtyRequired,
        name: import_database.products.name
      }).from(import_database.boms).innerJoin(import_database.products, (0, import_drizzle_orm.eq)(import_database.boms.rawMaterialId, import_database.products.id)).where((0, import_drizzle_orm.eq)(import_database.boms.productId, item.productId));
      if (ingredients.length > 0) {
        for (const ing of ingredients) {
          const needed = Number(ing.qtyRequired) * item.qty;
          const existing = stockRequirements.get(ing.rawMaterialId);
          if (existing) {
            existing.qty += needed;
          } else {
            stockRequirements.set(ing.rawMaterialId, { qty: needed, name: ing.name });
          }
        }
      } else {
        const product = productMap.get(item.productId);
        if (product) {
          const existing = stockRequirements.get(item.productId);
          if (existing) {
            existing.qty += item.qty;
          } else {
            stockRequirements.set(item.productId, { qty: item.qty, name: product.name });
          }
        }
      }
    }
    for (const [productId, req] of stockRequirements.entries()) {
      const [result] = await tx.select({
        currentStock: import_drizzle_orm.sql`COALESCE(SUM(${import_database.stockMoves.qty}), 0)`
      }).from(import_database.stockMoves).where(
        (0, import_drizzle_orm.and)(
          (0, import_drizzle_orm.eq)(import_database.stockMoves.branchId, input.branchId),
          (0, import_drizzle_orm.eq)(import_database.stockMoves.productId, productId)
        )
      );
      const currentStock = Number(result?.currentStock ?? 0);
      if (currentStock < req.qty) {
        throw new Error(
          `Stok Bahan Baku Habis: "${req.name}" tidak mencukupi. Tersedia: ${currentStock}, Dibutuhkan: ${req.qty}`
        );
      }
    }
    let totalCOGS = 0;
    for (const item of input.lines) {
      const productIngredients = await tx.select({
        rawMaterialId: import_database.boms.rawMaterialId,
        qtyRequired: import_database.boms.qtyRequired,
        purchasePrice: import_database.products.purchasePrice
      }).from(import_database.boms).innerJoin(import_database.products, (0, import_drizzle_orm.eq)(import_database.boms.rawMaterialId, import_database.products.id)).where((0, import_drizzle_orm.eq)(import_database.boms.productId, item.productId));
      if (productIngredients.length > 0) {
        for (const ingredient of productIngredients) {
          const qtyToDeduct = Number(ingredient.qtyRequired) * item.qty;
          const ingredientCost = Number(ingredient.purchasePrice) * qtyToDeduct;
          totalCOGS += ingredientCost;
          await tx.insert(import_database.stockMoves).values({
            branchId: input.branchId,
            productId: ingredient.rawMaterialId,
            qty: String(-qtyToDeduct),
            referenceType: "pos_sale",
            referenceId: insertedOrder.id
          });
        }
      } else {
        const product = productMap.get(item.productId);
        if (product) {
          const productCost = Number(product.purchasePrice) * item.qty;
          totalCOGS += productCost;
          await tx.insert(import_database.stockMoves).values({
            branchId: input.branchId,
            productId: item.productId,
            qty: String(-item.qty),
            referenceType: "pos_sale",
            referenceId: insertedOrder.id
          });
        }
      }
    }
    const [kasAccount] = await tx.select().from(import_database.accounts).where((0, import_drizzle_orm.eq)(import_database.accounts.code, "1101")).limit(1);
    const [revenueAccount] = await tx.select().from(import_database.accounts).where((0, import_drizzle_orm.eq)(import_database.accounts.code, "4101")).limit(1);
    const [hppAccount] = await tx.select().from(import_database.accounts).where((0, import_drizzle_orm.eq)(import_database.accounts.code, "5101")).limit(1);
    const [inventoryAccount] = await tx.select().from(import_database.accounts).where((0, import_drizzle_orm.eq)(import_database.accounts.code, "1401")).limit(1);
    if (!kasAccount || !revenueAccount || !hppAccount || !inventoryAccount) {
      throw new Error("Required accounting accounts (1101, 4101, 5101, 1401) not found");
    }
    const [journalEntry] = await tx.insert(import_database.journalEntries).values({
      reference: insertedOrder.id,
      description: `Sales Transaction ${insertedOrder.id}`
    }).returning();
    await tx.insert(import_database.journalItems).values([
      {
        journalEntryId: journalEntry.id,
        accountId: kasAccount.id,
        debit: String(finalTotal),
        credit: "0"
      },
      {
        journalEntryId: journalEntry.id,
        accountId: revenueAccount.id,
        debit: "0",
        credit: String(finalTotal)
      },
      // Item 2: COGS (Debit) -> Inventory (Credit)
      {
        journalEntryId: journalEntry.id,
        accountId: hppAccount.id,
        debit: String(totalCOGS),
        credit: "0"
      },
      {
        journalEntryId: journalEntry.id,
        accountId: inventoryAccount.id,
        debit: "0",
        credit: String(totalCOGS)
      }
    ]);
    return {
      orderId: insertedOrder.id,
      journalEntryId: journalEntry.id,
      total: finalTotal,
      cogs: totalCOGS
    };
  });
}

// src/services/procurement.service.ts
var import_drizzle_orm2 = require("drizzle-orm");
var import_database2 = require("@warung-bujo/database");
async function createPurchaseOrder(db, input) {
  return await db.transaction(async (tx) => {
    const totalAmount = input.lines.reduce(
      (sum, l) => sum + l.qty * l.unitPrice,
      0
    );
    const poNumber = `PO-${(/* @__PURE__ */ new Date()).getFullYear()}-${Date.now().toString().slice(-6)}`;
    const [po] = await tx.insert(import_database2.purchaseOrders).values({
      poNumber,
      supplierId: input.supplierId ?? null,
      branchId: input.branchId,
      status: "Received",
      totalAmount: String(totalAmount),
      notes: input.notes ?? null,
      receivedAt: /* @__PURE__ */ new Date()
    }).returning();
    await tx.insert(import_database2.purchaseOrderLines).values(
      input.lines.map((l) => ({
        purchaseOrderId: po.id,
        productId: l.productId,
        qty: String(l.qty),
        unitPrice: String(l.unitPrice),
        subtotal: String(l.qty * l.unitPrice)
      }))
    );
    for (const line of input.lines) {
      await tx.insert(import_database2.stockMoves).values({
        branchId: input.branchId,
        productId: line.productId,
        qty: String(line.qty),
        referenceType: "purchase",
        referenceId: po.id,
        notes: `Pembelian dari supplier - ${poNumber}`
      });
    }
    const [inventoryAccount] = await tx.select().from(import_database2.accounts).where((0, import_drizzle_orm2.eq)(import_database2.accounts.code, "1401")).limit(1);
    const [kasAccount] = await tx.select().from(import_database2.accounts).where((0, import_drizzle_orm2.eq)(import_database2.accounts.code, "1101")).limit(1);
    if (!inventoryAccount || !kasAccount) {
      throw new Error("Akun wajib (1401 Persediaan, 1101 Kas) tidak ditemukan");
    }
    const [journalEntry] = await tx.insert(import_database2.journalEntries).values({
      reference: poNumber,
      description: `Pembelian Bahan Baku ${poNumber}`
    }).returning();
    await tx.insert(import_database2.journalItems).values([
      {
        journalEntryId: journalEntry.id,
        accountId: inventoryAccount.id,
        debit: String(totalAmount),
        credit: "0"
      },
      {
        journalEntryId: journalEntry.id,
        accountId: kasAccount.id,
        debit: "0",
        credit: String(totalAmount)
      }
    ]);
    return {
      poId: po.id,
      poNumber,
      totalAmount,
      journalEntryId: journalEntry.id
    };
  });
}

// src/services/transfer.service.ts
var import_drizzle_orm3 = require("drizzle-orm");
var import_database3 = require("@warung-bujo/database");
async function createStockTransfer(db, input) {
  return await db.transaction(async (tx) => {
    for (const line of input.lines) {
      const [result] = await tx.select({
        currentStock: import_drizzle_orm3.sql`COALESCE(SUM(${import_database3.stockMoves.qty}), 0)`
      }).from(import_database3.stockMoves).where(
        (0, import_drizzle_orm3.and)(
          (0, import_drizzle_orm3.eq)(import_database3.stockMoves.branchId, input.fromBranchId),
          (0, import_drizzle_orm3.eq)(import_database3.stockMoves.productId, line.productId)
        )
      );
      const currentStock = Number(result?.currentStock ?? 0);
      if (currentStock < line.qty) {
        throw new Error(
          `STOCK_INSUFFICIENT:${line.productId}:${currentStock}:${line.qty}`
        );
      }
    }
    const transferNumber = `STR-${(/* @__PURE__ */ new Date()).getFullYear()}-${Date.now().toString().slice(-6)}`;
    const [transfer] = await tx.insert(import_database3.stockTransfers).values({
      transferNumber,
      fromBranchId: input.fromBranchId,
      toBranchId: input.toBranchId,
      status: "Received",
      notes: input.notes ?? null,
      receivedAt: /* @__PURE__ */ new Date()
    }).returning();
    await tx.insert(import_database3.stockTransferLines).values(
      input.lines.map((l) => ({
        transferId: transfer.id,
        productId: l.productId,
        qty: String(l.qty)
      }))
    );
    for (const line of input.lines) {
      await tx.insert(import_database3.stockMoves).values({
        branchId: input.fromBranchId,
        productId: line.productId,
        qty: String(-line.qty),
        referenceType: "transfer_out",
        referenceId: transfer.id,
        notes: `Kirim ke cabang - ${transferNumber}`
      });
    }
    for (const line of input.lines) {
      await tx.insert(import_database3.stockMoves).values({
        branchId: input.toBranchId,
        productId: line.productId,
        qty: String(line.qty),
        referenceType: "transfer_in",
        referenceId: transfer.id,
        notes: `Terima dari HQ - ${transferNumber}`
      });
    }
    return { transferId: transfer.id, transferNumber };
  });
}

// src/services/inventory.service.ts
var import_drizzle_orm4 = require("drizzle-orm");
var import_database4 = require("@warung-bujo/database");
async function getInventoryStock(db, branchId) {
  const baseQuery = db.select({
    branchId: import_database4.stockMoves.branchId,
    productId: import_database4.stockMoves.productId,
    currentStock: import_drizzle_orm4.sql`COALESCE(SUM(${import_database4.stockMoves.qty}), 0)`.as(
      "current_stock"
    )
  }).from(import_database4.stockMoves).groupBy(import_database4.stockMoves.branchId, import_database4.stockMoves.productId);
  if (branchId) {
    return await baseQuery.where((0, import_drizzle_orm4.eq)(import_database4.stockMoves.branchId, branchId));
  }
  return await baseQuery;
}
async function getLowStockAlerts(db, branchId) {
  const stockSubquery = db.select({
    branchId: import_database4.stockMoves.branchId,
    productId: import_database4.stockMoves.productId,
    currentStock: import_drizzle_orm4.sql`COALESCE(SUM(${import_database4.stockMoves.qty}), 0)`.as(
      "current_stock"
    )
  }).from(import_database4.stockMoves).groupBy(import_database4.stockMoves.branchId, import_database4.stockMoves.productId).as("stock_agg");
  const query = db.select({
    branchId: import_database4.stockMinLevels.branchId,
    productId: import_database4.stockMinLevels.productId,
    minQty: import_database4.stockMinLevels.minQty,
    currentStock: stockSubquery.currentStock,
    productName: import_database4.products.name,
    unit: import_database4.products.unit,
    branchName: import_database4.branches.name
  }).from(import_database4.stockMinLevels).leftJoin(
    stockSubquery,
    (0, import_drizzle_orm4.and)(
      (0, import_drizzle_orm4.eq)(stockSubquery.branchId, import_database4.stockMinLevels.branchId),
      (0, import_drizzle_orm4.eq)(stockSubquery.productId, import_database4.stockMinLevels.productId)
    )
  ).leftJoin(import_database4.products, (0, import_drizzle_orm4.eq)(import_database4.products.id, import_database4.stockMinLevels.productId)).leftJoin(import_database4.branches, (0, import_drizzle_orm4.eq)(import_database4.branches.id, import_database4.stockMinLevels.branchId));
  const results = branchId ? await query.where((0, import_drizzle_orm4.eq)(import_database4.stockMinLevels.branchId, branchId)) : await query;
  return results.filter(
    (r) => Number(r.currentStock ?? 0) <= Number(r.minQty)
  );
}

// src/index.ts
import_dotenv.default.config();
var app = (0, import_express.default)();
var port = process.env.PORT || 4e3;
app.use((0, import_cors.default)());
app.use(import_express.default.json());
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/checkout", async (req, res) => {
  try {
    const db = {};
    const result = await processPosCheckout(db, req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error.message?.startsWith("Stok Bahan Baku Habis")) {
      res.status(422).json({ error: error.message, code: "STOCK_INSUFFICIENT" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});
app.post("/api/procurement", async (req, res) => {
  try {
    const db = {};
    const result = await createPurchaseOrder(db, req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/transfers", async (req, res) => {
  try {
    const db = {};
    const result = await createStockTransfer(db, req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.message?.startsWith("STOCK_INSUFFICIENT")) {
      const [, name, available, needed] = error.message.split(":");
      res.status(422).json({
        error: `Stok tidak cukup untuk "${name}". Tersedia: ${available}, Dibutuhkan: ${needed}`,
        code: "STOCK_INSUFFICIENT"
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});
app.get("/api/inventory", async (req, res) => {
  try {
    const db = {};
    const { branchId } = req.query;
    const result = await getInventoryStock(db, branchId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/inventory/alerts", async (req, res) => {
  try {
    const db = {};
    const { branchId } = req.query;
    const result = await getLowStockAlerts(db, branchId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});

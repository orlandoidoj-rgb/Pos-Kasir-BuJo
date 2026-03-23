import { and, eq, inArray, sql } from "drizzle-orm";
import { insertStockMoves } from "../utils/stock";
import { createJournalEntry } from "../utils/journal";
import {
  stockMoves,
  stockMinLevels,
  products,
  branches,
} from "@warung-bujo/database";

/**
 * getStockBalances (Helper)
 * BATCH QUERY: Ambil current stock untuk multiple products di 1 cabang.
 * 
 * Before: N queries dalam loop.
 * After: 1 query menggunakan IN clause.
 */
export async function getStockBalances(
  tx: any,
  branchId: string,
  productIds: string[]
): Promise<Map<string, number>> {
  if (productIds.length === 0) return new Map();

  const results = await tx
    .select({
      productId: stockMoves.productId,
      currentStock: sql<number>`COALESCE(SUM(${stockMoves.qty}), 0)`.as("current_stock"),
    })
    .from(stockMoves)
    .where(
      and(
        eq(stockMoves.branchId, branchId),
        // Batch condition
        inArray(stockMoves.productId, productIds)
      )
    )
    .groupBy(stockMoves.productId);

  const stockMap = new Map<string, number>();
  for (const row of results) {
    stockMap.set(row.productId, Number(row.currentStock));
  }
  return stockMap;
}

/**
 * getStockAcrossBranches (Helper)
 * BATCH QUERY: Ambil current stock untuk 1 product di multiple cabang.
 */
export async function getStockAcrossBranches(
  tx: any,
  productId: string,
  branchIds: string[]
): Promise<Map<string, number>> {
  if (branchIds.length === 0) return new Map();

  const results = await tx
    .select({
      branchId: stockMoves.branchId,
      currentStock: sql<number>`COALESCE(SUM(${stockMoves.qty}), 0)`.as("current_stock"),
    })
    .from(stockMoves)
    .where(
      and(
        eq(stockMoves.productId, productId),
        inArray(stockMoves.branchId, branchIds)
      )
    )
    .groupBy(stockMoves.branchId);

  const stockMap = new Map<string, number>();
  for (const row of results) {
    stockMap.set(row.branchId, Number(row.currentStock));
  }
  return stockMap;
}

/**
 * getLowStockAlerts
 * Returns items where current stock <= min qty.
 * 
 * Before: Loop per produk, query stock_moves berulang kali lalu filter di memory.
 * After: 1x query join dengan HAVING SQL logic langsung.
 */
export async function getLowStockAlerts(db: any, branchId?: string) {
  const query = db
    .select({
      branchId: stockMinLevels.branchId,
      productId: stockMinLevels.productId,
      minQty: stockMinLevels.minQty,
      // Aggregasi dihitung di dalam query
      currentStock: sql<number>`COALESCE(SUM(${stockMoves.qty}), 0)`.as("current_stock"),
      productName: products.name,
      unit: products.unit,
      branchName: branches.name,
    })
    .from(stockMinLevels)
    .leftJoin(
      stockMoves,
      and(
        eq(stockMoves.branchId, stockMinLevels.branchId),
        eq(stockMoves.productId, stockMinLevels.productId)
      )
    )
    .leftJoin(products, eq(products.id, stockMinLevels.productId))
    .leftJoin(branches, eq(branches.id, stockMinLevels.branchId));
    
  if (branchId) {
    query.where(eq(stockMinLevels.branchId, branchId));
  }
  
  query.groupBy(
    stockMinLevels.branchId,
    stockMinLevels.productId,
    stockMinLevels.minQty,
    products.name,
    products.unit,
    branches.name
  );
  
  // HAVING current_stock <= min_qty
  query.having(sql`${sql`COALESCE(SUM(${stockMoves.qty}), 0)`} <= ${stockMinLevels.minQty}`);

  return await query;
}

/**
 * getInventoryStock
 * Menampilkan laporan stok per produk pada cabang tertentu atau konsolidasi
 */
export async function getInventoryStock(
  db: any, 
  branchId?: string,
  // Params filter cursor & range untuk Optimisasi Inventory Report
  cursorDate?: string,
  limit: number = 50
) {
  const baseQuery = db
    .select({
      branchId: stockMoves.branchId,
      productId: stockMoves.productId,
      currentStock: sql<number>`COALESCE(SUM(${stockMoves.qty}), 0)`.as("current_stock"),
    })
    .from(stockMoves);

  const conditions = [];
  if (branchId) {
    conditions.push(eq(stockMoves.branchId, branchId));
  }
  
  // Date range filter / cursor based pagination
  if (cursorDate) {
    conditions.push(sql`${stockMoves.createdAt} < ${cursorDate}`); 
  }

  if (conditions.length > 0) {
    baseQuery.where(and(...conditions));
  }

  return await baseQuery
    .groupBy(stockMoves.branchId, stockMoves.productId)
    .limit(limit);
}

// ─── FASE 3: MANUAL OPERATIONS ──────────────────────────────────────────────────

export async function manualStockIn(db: any, branchId: string, productId: string, qty: number, notes?: string) {
  return await db.transaction(async (tx: any) => {
    await insertStockMoves(tx, [{
      branchId, 
      productId,
      qty: Number(qty), // POSITIF
      referenceType: "manual_in",
      notes: notes || "Manual stock in",
    }]);
    return true;
  });
}

export async function manualStockOut(db: any, branchId: string, productId: string, qty: number, notes?: string) {
  return await db.transaction(async (tx: any) => {
    await insertStockMoves(tx, [{
      branchId, 
      productId,
      qty: -Number(qty), // NEGATIF
      referenceType: "manual_out",
      notes: notes || "Manual stock out",
    }]);
    return true;
  });
}

export async function stockAdjustment(
  db: any, 
  branchId: string, 
  productId: string, 
  qty: number, 
  reason: string, 
  skipJournal: boolean = false, 
  unitCost: number = 0
) {
  return await db.transaction(async (tx: any) => {
    // qty is positive for gains, negative for losses
    const adjustmentId = `ADJ-${Date.now()}`;
    await insertStockMoves(tx, [{
      branchId, 
      productId,
      qty: Number(qty),
      referenceType: "adjustment",
      referenceId: adjustmentId,
      notes: `Adjustment: ${reason}`,
    }]);

    if (!skipJournal && qty < 0) {
      const lossValue = Math.abs(qty) * unitCost;
      await createJournalEntry(tx, adjustmentId, `Adjustment: ${reason}`, [
        { accountCode: "5201", debit: lossValue, credit: 0 },
        { accountCode: "1401", debit: 0, credit: lossValue },
      ]);
    } else if (!skipJournal && qty > 0) {
      const gainValue = Math.abs(qty) * unitCost;
      await createJournalEntry(tx, adjustmentId, `Adjustment: ${reason}`, [
        { accountCode: "1401", debit: gainValue, credit: 0 },
        { accountCode: "4201", debit: 0, credit: gainValue },
      ]);
    }

    return true;
  });
}

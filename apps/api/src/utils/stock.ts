import { sql, inArray } from "drizzle-orm";
import { stockMoves, productStocks } from "@warung-bujo/database/src/schema/inventory.schema";

export interface StockMoveInput {
  branchId: string;
  productId: string;
  qty: number;
  referenceType: "pos_sale" | "manual_in" | "manual_out" | "adjustment" | "purchase" | "transfer_in" | "transfer_out";
  referenceId?: string;
  notes?: string;
}

export async function insertStockMoves(tx: any, moves: StockMoveInput[]): Promise<void> {
  if (moves.length === 0) return;
  
  // 1. Insert ke stock_moves
  await tx.insert(stockMoves).values(moves.map(m => ({
    ...m,
    qty: String(m.qty)
  })));

  // 2. Aggregate quantity per product+branch
  const stockDeltas = new Map<string, number>();
  for (const move of moves) {
    const key = `${move.branchId}_${move.productId}`;
    stockDeltas.set(key, (stockDeltas.get(key) || 0) + move.qty);
  }

  // 3. UPSERT ke product_stocks
  for (const [key, qty] of stockDeltas.entries()) {
    const [branchId, productId] = key.split("_");
    await tx.insert(productStocks)
      .values({
        branchId,
        productId,
        currentQty: String(qty)
      })
      .onConflictDoUpdate({
        target: [productStocks.branchId, productStocks.productId],
        set: {
          currentQty: sql`${productStocks.currentQty} + ${qty}`,
          updatedAt: new Date()
        }
      });
  }
}

export async function getStockBalances(tx: any, branchId: string, productIds: string[]): Promise<Map<string, number>> {
  if (productIds.length === 0) return new Map();
  const balances = await tx.select({
    productId: productStocks.productId,
    qty: productStocks.currentQty
  })
  .from(productStocks)
  .where(
    sql`${productStocks.branchId} = ${branchId} AND ${productStocks.productId} IN (${sql.join(productIds, sql`, `)})`
  );

  const stockMap = new Map<string, number>();
  balances.forEach((b: any) => stockMap.set(b.productId, Number(b.qty)));
  return stockMap;
}

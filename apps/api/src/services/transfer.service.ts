import {
  stockTransfers,
  stockTransferLines,
} from "@warung-bujo/database";
import { insertStockMoves, getStockBalances, StockMoveInput } from "../utils/stock";

export interface TransferLineInput {
  productId: string;
  qty: number;
}

export interface TransferInput {
  fromBranchId: string;
  toBranchId: string;
  notes?: string;
  lines: TransferLineInput[];
}

/**
 * createStockTransfer
 * Distribusi bahan baku dari Pusat ke Cabang:
 * 1. Validasi stok mencukupi di fromBranch
 * 2. Insert stock_transfer + lines
 * 3. Create negative stock_moves di fromBranch (transfer_out)
 * 4. Create positive stock_moves di toBranch (transfer_in)
 */
export async function createStockTransfer(db: any, input: TransferInput) {
  return await db.transaction(async (tx: any) => {
    // ✅ P2: Validasi stok di cabang asal dengan getStockBalances
    const productIds = input.lines.map(l => l.productId);
    const balances = await getStockBalances(tx, input.fromBranchId, productIds);

    for (const line of input.lines) {
      const currentStock = balances.get(line.productId) || 0;
      if (currentStock < line.qty) {
        throw new Error(
          `STOCK_INSUFFICIENT:${line.productId}:${currentStock}:${line.qty}`
        );
      }
    }

    const transferNumber = `STR-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    // Insert transfer header
    const [transfer] = await tx
      .insert(stockTransfers)
      .values({
        transferNumber,
        fromBranchId: input.fromBranchId,
        toBranchId: input.toBranchId,
        status: "Received",
        notes: input.notes ?? null,
        receivedAt: new Date(),
      })
      .returning();

    // Insert transfer lines
    await tx.insert(stockTransferLines).values(
      input.lines.map((l) => ({
        transferId: transfer.id,
        productId: l.productId,
        qty: String(l.qty),
      }))
    );

    // ✅ P2: Kurangi stok di cabang asal menggunakan insertStockMoves
    const outMoves: StockMoveInput[] = input.lines.map((line) => ({
      branchId: input.fromBranchId,
      productId: line.productId,
      qty: -Number(line.qty), // NEGATIF (keluar)
      referenceType: "transfer_out" as const,
      referenceId: transfer.id,
      notes: `Kirim ke cabang - ${transferNumber}`,
    }));
    await insertStockMoves(tx, outMoves);

    // ✅ P2: Tambah stok di cabang tujuan menggunakan insertStockMoves
    const inMoves: StockMoveInput[] = input.lines.map((line) => ({
      branchId: input.toBranchId,
      productId: line.productId,
      qty: Number(line.qty), // POSITIF (masuk)
      referenceType: "transfer_in" as const,
      referenceId: transfer.id,
      notes: `Terima dari HQ - ${transferNumber}`,
    }));
    await insertStockMoves(tx, inMoves);

    return { transferId: transfer.id, transferNumber };
  });
}

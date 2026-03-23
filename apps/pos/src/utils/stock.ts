import { BOMLine, BranchStockItem, CartItem } from '../types';
import { BOM_KEY, BRANCH_STOCK_KEY } from '../config';

export function getBOM(): Record<string, BOMLine[]> {
  try { return JSON.parse(localStorage.getItem(BOM_KEY) ?? '{}'); } catch { return {}; }
}

export function getBranchStock(branchId: string): BranchStockItem[] {
  try {
    const all = JSON.parse(localStorage.getItem(BRANCH_STOCK_KEY) ?? '{}');
    return all[branchId] ?? [];
  } catch { return []; }
}

export function saveBranchStock(branchId: string, stock: BranchStockItem[]) {
  try {
    const all = JSON.parse(localStorage.getItem(BRANCH_STOCK_KEY) ?? '{}');
    all[branchId] = stock;
    localStorage.setItem(BRANCH_STOCK_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

export function deductBOMStock(branchId: string, cart: CartItem[]) {
  const bom   = getBOM();
  const stock = getBranchStock(branchId);
  cart.forEach(item => {
    (bom[item.id] ?? []).forEach(line => {
      const usage = line.qty * item.qty;
      const idx = stock.findIndex(s => s.materialId === line.materialId);
      if (idx >= 0) stock[idx] = { ...stock[idx], stok: Math.max(0, stock[idx].stok - usage) };
    });
  });
  saveBranchStock(branchId, stock);
}

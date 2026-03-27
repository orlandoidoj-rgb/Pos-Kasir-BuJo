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
      let usageLeft = line.qty * item.qty;
      const idx = stock.findIndex(s => s.materialId === line.materialId);
      
      if (idx >= 0) {
        const material = stock[idx];
        
        // If no batches, fallback to simple deduction
        if (!material.batches || material.batches.length === 0) {
          material.stok = Math.max(0, material.stok - usageLeft);
        } else {
          // FIFO Batch Deduction
          while (usageLeft > 0 && material.batches.length > 0) {
            const batch = material.batches[0];
            if (batch.qty <= usageLeft) {
              usageLeft -= batch.qty;
              material.batches.shift(); // Batch completed
            } else {
              batch.qty -= usageLeft;
              usageLeft = 0;
            }
          }
          
          // Update aggregates
          material.stok = material.batches.reduce((sum, b) => sum + b.qty, 0);
          
          // Update average price for display (HPP benchmark)
          if (material.batches.length > 0) {
            const totalVal = material.batches.reduce((sum, b) => sum + (b.qty * b.buyPrice), 0);
            material.harga = totalVal / material.stok;
          }
        }
        stock[idx] = { ...material };
      }
    });
  });
  saveBranchStock(branchId, stock);
}

import { BranchInfo, POSProduct, BackofficeProduct } from '../types';
import { BRANCHES_KEY, STORAGE_KEY, TX_STORAGE, DEFAULT_PRODUCTS } from '../config';

export function loadBranches(): BranchInfo[] {
  try {
    const raw = localStorage.getItem(BRANCHES_KEY);
    if (!raw) return [{ id:'CBG-001', nama:'Malang Pusat', status:'active', isOwnerPrimary:true }];
    return JSON.parse(raw) as BranchInfo[];
  } catch { return [{ id:'CBG-001', nama:'Malang Pusat', status:'active', isOwnerPrimary:true }]; }
}

export function loadAllProducts(): POSProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRODUCTS;
    const list = JSON.parse(raw) as BackofficeProduct[];
    const mapped = list.filter(p => p.isSellable && p.isActive).map(p => ({
      id: p.id, name: p.name, hpp: p.purchasePrice ?? 0,
      allPrices: p.prices ?? {'Dine-in':0,'Take-away':0,'Shopee':0,'Grab':0,'Gofood':0},
      category: p.categoryId, image: p.image, unit: p.unit,
      branchActivations: p.branchActivations ?? {'CBG-001':true},
    }));
    return mapped.length > 0 ? mapped : DEFAULT_PRODUCTS;
  } catch { return DEFAULT_PRODUCTS; }
}

export function saveTransaction(tx: object) {
  try {
    const existing = JSON.parse(localStorage.getItem(TX_STORAGE) ?? '[]');
    localStorage.setItem(TX_STORAGE, JSON.stringify([tx, ...existing]));
  } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// Warung BuJo — Shared Storage Module
// Semua localStorage ops terpusat di sini agar POS & Backoffice sinkron.
// ─────────────────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  PRODUCTS:        'warung_bujo_products',
  MATERIAL_PRICES: 'warung_bujo_material_prices',
  TRANSACTIONS:    'warung_bujo_transactions',
  BOM:             'warung_bujo_bom',
  BRANCHES:        'warung_bujo_branches',
  BRANCH_STOCK:    'warung_bujo_branch_stock',
  POS_SESSIONS:    'warung_bujo_pos_sessions',
  CUSTOMERS:       'warung_bujo_customers',
  VOUCHERS:        'warung_bujo_vouchers',
  LOYALTY_CONFIG:  'warung_bujo_loyalty_config',
  ACCOUNTS:        'warung_bujo_accounts',
  TRANSFERS:       'warung_bujo_transfers',
} as const;

// ─── Order Types ─────────────────────────────────────────────────────────────

export type OrderType = 'Dine-in' | 'Take-away' | 'Shopee' | 'Grab' | 'Gofood';

export const ORDER_TYPE_META: Record<OrderType, { label: string; color: string; bg: string; textColor: string }> = {
  'Dine-in':   { label: 'Dine-in',   color: 'indigo', bg: 'bg-indigo-600',  textColor: 'text-white'         },
  'Take-away': { label: 'Take Away', color: 'amber',  bg: 'bg-amber-500',   textColor: 'text-black'         },
  'Shopee':    { label: 'Shopee',    color: 'orange', bg: 'bg-orange-500',  textColor: 'text-white'         },
  'Grab':      { label: 'Grab',      color: 'emerald',bg: 'bg-emerald-600', textColor: 'text-white'         },
  'Gofood':    { label: 'GoFood',    color: 'red',    bg: 'bg-red-600',     textColor: 'text-white'         },
};

export const ORDER_TYPES = Object.keys(ORDER_TYPE_META) as OrderType[];

// ─── Branch ───────────────────────────────────────────────────────────────────

export interface Branch {
  id: string;
  nama: string;
  alamat: string;
  kota: string;
  status: 'active' | 'inactive';
  manager: string;
  telp: string;
  isOwnerPrimary?: boolean; // display-only, no data effect — first branch shown first
}

export const DEFAULT_BRANCHES: Branch[] = [
  { id: 'dfda8a9c-7e8e-4a8e-9522-320e52e189d1', nama: 'Malang Pusat',      alamat: 'Jl. Kawi No. 12',         kota: 'Malang',   status: 'active',   manager: 'Budi Santoso',    telp: '0341-123456', isOwnerPrimary: true },
  { id: 'dfda8a9c-7e8e-4a8e-9522-320e52e189d2', nama: 'Malang Kayutangan', alamat: 'Jl. Basuki Rahmat No. 5', kota: 'Malang',   status: 'active',   manager: 'Siti Rahayu',     telp: '0341-234567' },
  { id: 'dfda8a9c-7e8e-4a8e-9522-320e52e189d3', nama: 'Surabaya Barat',    alamat: 'Jl. Raya Darmo No. 88',   kota: 'Surabaya', status: 'active',   manager: 'Agus Kurniawan',  telp: '031-345678'  },
  { id: 'dfda8a9c-7e8e-4a8e-9522-320e52e189d4', nama: 'Jakarta Selatan',   alamat: 'Jl. Kemang Raya No. 21',  kota: 'Jakarta',  status: 'inactive', manager: '(belum ditentukan)', telp: '—' },
];

export function getBranches(): Branch[] {
  try {
    const s = localStorage.getItem(STORAGE_KEYS.BRANCHES);
    const data: Branch[] = s ? JSON.parse(s) : [...DEFAULT_BRANCHES];
    // Always put the owner-primary branch first — display priority only
    return data.sort((a, b) => (b.isOwnerPrimary ? 1 : 0) - (a.isOwnerPrimary ? 1 : 0));
  } catch { return [...DEFAULT_BRANCHES]; }
}

export function saveBranches(branches: Branch[]) {
  localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
}

// ─── Product Catalog ──────────────────────────────────────────────────────────

export interface ProductPrices {
  'Dine-in':   number;
  'Take-away': number;
  'Shopee':    number;
  'Grab':      number;
  'Gofood':    number;
}

export interface MasterProduct {
  id:                string;
  name:              string;
  prices:            ProductPrices;
  purchasePrice:     number;      // HPP — auto dari BOM atau manual
  categoryId:        string;
  image:             string;      // base64 data URL atau URL eksternal
  imagePath:         string;      // path virtual: "menu-utama/ayam-goreng"
  unit:              string;
  isSellable:        boolean;
  isActive:          boolean;
  branchActivations: Record<string, boolean>; // branchId -> active at that branch
}

// ─── BOM ─────────────────────────────────────────────────────────────────────

export interface BOMLine {
  materialId:   string;
  materialName: string;
  qty:          number;
  unit:         string;
}

/** BOM default: productId → daftar bahan baku (dikosongkan — user mulai dari nol) */
export const DEFAULT_BOM: Record<string, BOMLine[]> = {};

export function getBOM(): Record<string, BOMLine[]> {
  try {
    const s = localStorage.getItem(STORAGE_KEYS.BOM);
    return s ? JSON.parse(s) : { ...DEFAULT_BOM };
  } catch { return { ...DEFAULT_BOM }; }
}

export function saveBOM(bom: Record<string, BOMLine[]>) {
  localStorage.setItem(STORAGE_KEYS.BOM, JSON.stringify(bom));
}

export function saveBOMForProduct(productId: string, lines: BOMLine[]) {
  const bom = getBOM();
  if (lines.length === 0) {
    delete bom[productId];
  } else {
    bom[productId] = lines;
  }
  saveBOM(bom);
}

// ─── Material Prices ──────────────────────────────────────────────────────────

export interface MaterialPrice {
  name:         string;
  pricePerUnit: number;
  unit:         string;
  updatedAt:    string;
}

/** Harga bahan baku default (di-overwrite tiap kali Pengadaan disimpan) */
export const DEFAULT_MATERIAL_PRICES: Record<string, MaterialPrice> = {
  'BHN-001': { name: 'Beras Pandan',  pricePerUnit: 12000, unit: 'Kg',    updatedAt: '2026-03-01' },
  'BHN-002': { name: 'Ayam Fillet',   pricePerUnit: 45000, unit: 'Kg',    updatedAt: '2026-03-01' },
  'BHN-003': { name: 'Minyak Goreng', pricePerUnit: 18000, unit: 'Liter', updatedAt: '2026-03-01' },
  'BHN-004': { name: "Garam Halus",   pricePerUnit:  5000, unit: 'Kg',    updatedAt: '2026-03-01' },
  'BHN-005': { name: 'Teh Celup',     pricePerUnit:  8500, unit: 'Kotak', updatedAt: '2026-03-01' },
  'BHN-006': { name: 'Gula Pasir',    pricePerUnit: 14000, unit: 'Kg',    updatedAt: '2026-03-01' },
  'BHN-007': { name: 'Sambal Terasi', pricePerUnit: 25000, unit: 'Kg',    updatedAt: '2026-03-01' },
  'BHN-008': { name: 'Tepung Terigu', pricePerUnit:  9000, unit: 'Kg',    updatedAt: '2026-03-01' },
};

export interface StockBatch {
  id: string;
  qty: number;
  buyPrice: number;
  date: string;
}

export function getMaterialPrices(): Record<string, MaterialPrice> {
  try {
    const s = localStorage.getItem(STORAGE_KEYS.MATERIAL_PRICES);
    return s ? { ...DEFAULT_MATERIAL_PRICES, ...JSON.parse(s) } : { ...DEFAULT_MATERIAL_PRICES };
  } catch { return { ...DEFAULT_MATERIAL_PRICES }; }
}

export function saveMaterialPrice(materialId: string, data: MaterialPrice) {
  const current = getMaterialPrices();
  current[materialId] = data;
  localStorage.setItem(STORAGE_KEYS.MATERIAL_PRICES, JSON.stringify(current));
}

/**
 * Hitung HPP produk dari BOM + harga bahan baku (menggunakan FIFO dari batch aktif).
 */
export function calculateHPP(productId: string): { total: number; lines: Array<{ name: string; qty: number; unit: string; unitPrice: number; cost: number }> } {
  const bom    = getBOM();
  const allStock = getAllBranchStock(); // Helper needed to aggregate or pick primary
  const primaryBranch = 'dfda8a9c-7e8e-4a8e-9522-320e52e189d1';
  const branchStock = allStock[primaryBranch] ?? [];
  
  const lines  = bom[productId] ?? [];
  let total = 0;
  
  const detail = lines.map(l => {
    const stockItem = branchStock.find(s => s.materialId === l.materialId);
    let unitPrice = 0;
    
    if (stockItem && stockItem.batches && stockItem.batches.length > 0) {
      // Untuk benchmark HPP, kita gunakan weighted average dari batch yang MASIH ADA
      const totalQty = stockItem.batches.reduce((sum, b) => sum + b.qty, 0);
      const totalVal = stockItem.batches.reduce((sum, b) => sum + (b.qty * b.buyPrice), 0);
      unitPrice = totalQty > 0 ? totalVal / totalQty : stockItem.harga;
    } else {
      unitPrice = stockItem?.harga ?? 0;
    }
    
    const cost = l.qty * unitPrice;
    total += cost;
    return { name: l.materialName, qty: l.qty, unit: l.unit, unitPrice: Math.round(unitPrice), cost: Math.round(cost) };
  });
  
  return { total: Math.round(total), lines: detail };
}

// ─── Default Products (with branchActivations) ────────────────────────────────

export const DEFAULT_PRODUCTS: MasterProduct[] = [
  { id: 'PRD-001', name: 'Ayam Penyet Lalapan', categoryId: '1', unit: 'Porsi', isSellable: true, isActive: true,
    prices: { 'Dine-in': 25000, 'Take-away': 25000, 'Shopee': 27000, 'Grab': 27000, 'Gofood': 27000 },
    purchasePrice: 10000,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=800&auto=format&fit=crop',
    imagePath: 'menu-utama/ayam-penyet-lalapan/',
    branchActivations: { 'dfda8a9c-7e8e-4a8e-9522-320e52e189d1': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d2': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d3': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d4': false } },
  { id: 'PRD-002', name: 'Bebek Bakar Madu', categoryId: '1', unit: 'Porsi', isSellable: true, isActive: true,
    prices: { 'Dine-in': 35000, 'Take-away': 35000, 'Shopee': 38000, 'Grab': 38000, 'Gofood': 38000 },
    purchasePrice: 14000,
    image: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?q=80&w=800&auto=format&fit=crop',
    imagePath: 'menu-utama/bebek-bakar-madu/',
    branchActivations: { 'dfda8a9c-7e8e-4a8e-9522-320e52e189d1': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d2': false, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d3': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d4': false } },
  { id: 'PRD-003', name: 'Lele Goreng Crispy', categoryId: '1', unit: 'Porsi', isSellable: true, isActive: true,
    prices: { 'Dine-in': 18000, 'Take-away': 18000, 'Shopee': 20000, 'Grab': 20000, 'Gofood': 20000 },
    purchasePrice: 7000,
    image: 'https://images.unsplash.com/photo-1598511726623-d3455a1d713c?q=80&w=800&auto=format&fit=crop',
    imagePath: 'menu-utama/lele-goreng-crispy/',
    branchActivations: { 'dfda8a9c-7e8e-4a8e-9522-320e52e189d1': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d2': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d3': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d4': false } },
  { id: 'PRD-004', name: 'Nasi Goreng Spesial', categoryId: '1', unit: 'Porsi', isSellable: true, isActive: true,
    prices: { 'Dine-in': 22000, 'Take-away': 22000, 'Shopee': 24000, 'Grab': 24000, 'Gofood': 24000 },
    purchasePrice: 8200,
    image: 'https://images.unsplash.com/photo-1562802378-063ec186a863?q=80&w=800&auto=format&fit=crop',
    imagePath: 'menu-utama/nasi-goreng-spesial/',
    branchActivations: { 'dfda8a9c-7e8e-4a8e-9522-320e52e189d1': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d2': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d3': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d4': false } },
  { id: 'PRD-005', name: 'Tempe & Tahu Bacem', categoryId: '2', unit: 'Porsi', isSellable: true, isActive: true,
    prices: { 'Dine-in': 8000, 'Take-away': 8000, 'Shopee': 9000, 'Grab': 9000, 'Gofood': 9000 },
    purchasePrice: 3000,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    imagePath: 'tambahan/tempe-tahu-bacem/',
    branchActivations: { 'dfda8a9c-7e8e-4a8e-9522-320e52e189d1': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d2': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d3': false, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d4': false } },
  { id: 'PRD-006', name: 'Kerupuk Udang', categoryId: '2', unit: 'Porsi', isSellable: true, isActive: true,
    prices: { 'Dine-in': 3000, 'Take-away': 3000, 'Shopee': 4000, 'Grab': 4000, 'Gofood': 4000 },
    purchasePrice: 1000,
    image: '',
    imagePath: 'tambahan/kerupuk-udang/',
    branchActivations: { 'dfda8a9c-7e8e-4a8e-9522-320e52e189d1': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d2': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d3': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d4': false } },
  { id: 'PRD-007', name: 'Es Teh Manis Jumbo', categoryId: '3', unit: 'Gelas', isSellable: true, isActive: true,
    prices: { 'Dine-in': 5000, 'Take-away': 5000, 'Shopee': 6000, 'Grab': 6000, 'Gofood': 6000 },
    purchasePrice: 850,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop',
    imagePath: 'minuman/es-teh-manis-jumbo/',
    branchActivations: { 'dfda8a9c-7e8e-4a8e-9522-320e52e189d1': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d2': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d3': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d4': false } },
  { id: 'PRD-008', name: 'Es Jeruk Nipis', categoryId: '3', unit: 'Gelas', isSellable: true, isActive: true,
    prices: { 'Dine-in': 7000, 'Take-away': 7000, 'Shopee': 8000, 'Grab': 8000, 'Gofood': 8000 },
    purchasePrice: 1500,
    image: 'https://images.unsplash.com/photo-1621236378699-8597faa64b0f?q=80&w=800&auto=format&fit=crop',
    imagePath: 'minuman/es-jeruk-nipis/',
    branchActivations: { 'dfda8a9c-7e8e-4a8e-9522-320e52e189d1': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d2': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d3': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d4': false } },
  { id: 'PRD-009', name: 'Paket Hemat A', categoryId: '4', unit: 'Paket', isSellable: true, isActive: true,
    prices: { 'Dine-in': 28000, 'Take-away': 28000, 'Shopee': 30000, 'Grab': 30000, 'Gofood': 30000 },
    purchasePrice: 12000,
    image: '',
    imagePath: 'paket-hemat/paket-hemat-a/',
    branchActivations: { 'dfda8a9c-7e8e-4a8e-9522-320e52e189d1': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d2': true, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d3': false, 'dfda8a9c-7e8e-4a8e-9522-320e52e189d4': false } },
];

export function getProducts(): MasterProduct[] {
  try {
    const s = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!s) return [...DEFAULT_PRODUCTS];
    const stored = JSON.parse(s) as MasterProduct[];
    // Migrate: ensure branchActivations exists on every product
    return stored.map(p => ({
      ...p,
      branchActivations: p.branchActivations ?? { 'dfda8a9c-7e8e-4a8e-9522-320e52e189d1': true },
    }));
  } catch { return [...DEFAULT_PRODUCTS]; }
}

export function saveProducts(products: MasterProduct[]) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

export function saveProduct(product: MasterProduct) {
  const all = getProducts();
  const idx = all.findIndex(p => p.id === product.id);
  if (idx >= 0) all[idx] = product; else all.push(product);
  saveProducts(all);
}

// ─── Branch Stock ──────────────────────────────────────────────────────────────

export interface BranchStockItem {
  materialId:   string;
  materialName: string;
  satuan:       string;
  stok:         number;
  stokMin:      number;
  harga:        number; // Ini akan berfungsi sebagai Current Average Price
  batches?:     StockBatch[];
}

export const DEFAULT_BRANCH_STOCK: Record<string, BranchStockItem[]> = {
  'dfda8a9c-7e8e-4a8e-9522-320e52e189d1': [
    { materialId: 'BHN-001', materialName: 'Beras Pandan',  satuan: 'Kg',    stok: 45,  stokMin: 10, harga: 12000, batches: [{ id: 'B1-001', qty: 45, buyPrice: 12000, date: '2026-03-01' }] },
    { materialId: 'BHN-002', materialName: 'Ayam Fillet',   satuan: 'Kg',    stok: 8.5, stokMin: 5,  harga: 45000, batches: [{ id: 'B2-001', qty: 8.5, buyPrice: 45000, date: '2026-03-01' }] },
    { materialId: 'BHN-003', materialName: 'Minyak Goreng', satuan: 'Liter', stok: 20,  stokMin: 8,  harga: 18000, batches: [{ id: 'B3-001', qty: 20, buyPrice: 18000, date: '2026-03-01' }] },
    { materialId: 'BHN-004', materialName: 'Garam Halus',   satuan: 'Kg',    stok: 3,   stokMin: 1,  harga: 5000,  batches: [{ id: 'B4-001', qty: 3, buyPrice: 5000, date: '2026-03-01' }] },
    { materialId: 'BHN-005', materialName: 'Teh Celup',     satuan: 'Kotak', stok: 12,  stokMin: 5,  harga: 8500,  batches: [{ id: 'B5-001', qty: 12, buyPrice: 8500, date: '2026-03-01' }] },
    { materialId: 'BHN-006', materialName: 'Gula Pasir',    satuan: 'Kg',    stok: 18,  stokMin: 5,  harga: 14000, batches: [{ id: 'B6-001', qty: 18, buyPrice: 14000, date: '2026-03-01' }] },
    { materialId: 'BHN-007', materialName: 'Sambal Terasi', satuan: 'Kg',    stok: 2.1, stokMin: 3,  harga: 25000, batches: [{ id: 'B7-001', qty: 2.1, buyPrice: 25000, date: '2026-03-01' }] },
    { materialId: 'BHN-008', materialName: 'Tepung Terigu', satuan: 'Kg',    stok: 30,  stokMin: 10, harga: 9000,  batches: [{ id: 'B8-001', qty: 30, buyPrice: 9000, date: '2026-03-01' }] },
  ],
  'dfda8a9c-7e8e-4a8e-9522-320e52e189d2': [
    { materialId: 'BHN-001', materialName: 'Beras Pandan',  satuan: 'Kg',    stok: 12,  stokMin: 8,  harga: 12000, batches: [{ id: 'B1-002', qty: 12, buyPrice: 12000, date: '2026-03-01' }] },
    { materialId: 'BHN-002', materialName: 'Ayam Fillet',   satuan: 'Kg',    stok: 3,   stokMin: 4,  harga: 45000, batches: [{ id: 'B2-002', qty: 3, buyPrice: 45000, date: '2026-03-01' }] },
    { materialId: 'BHN-003', materialName: 'Minyak Goreng', satuan: 'Liter', stok: 6,   stokMin: 4,  harga: 18000, batches: [{ id: 'B3-002', qty: 6, buyPrice: 18000, date: '2026-03-01' }] },
    { materialId: 'BHN-005', materialName: 'Teh Celup',     satuan: 'Kotak', stok: 3,   stokMin: 5,  harga: 8500,  batches: [{ id: 'B5-002', qty: 3, buyPrice: 8500, date: '2026-03-01' }] },
    { materialId: 'BHN-006', materialName: 'Gula Pasir',    satuan: 'Kg',    stok: 5,   stokMin: 3,  harga: 14000, batches: [{ id: 'B6-002', qty: 5, buyPrice: 14000, date: '2026-03-01' }] },
    { materialId: 'BHN-007', materialName: 'Sambal Terasi', satuan: 'Kg',    stok: 0.8, stokMin: 2,  harga: 25000, batches: [{ id: 'B7-002', qty: 0.8, buyPrice: 25000, date: '2026-03-01' }] },
  ],
  'dfda8a9c-7e8e-4a8e-9522-320e52e189d3': [
    { materialId: 'BHN-001', materialName: 'Beras Pandan',  satuan: 'Kg',    stok: 20,  stokMin: 8,  harga: 12000, batches: [{ id: 'B1-003', qty: 20, buyPrice: 12000, date: '2026-03-01' }] },
    { materialId: 'BHN-002', materialName: 'Ayam Fillet',   satuan: 'Kg',    stok: 5,   stokMin: 4,  harga: 45000, batches: [{ id: 'B2-003', qty: 5, buyPrice: 45000, date: '2026-03-01' }] },
    { materialId: 'BHN-003', materialName: 'Minyak Goreng', satuan: 'Liter', stok: 10,  stokMin: 6,  harga: 18000, batches: [{ id: 'B3-003', qty: 10, buyPrice: 18000, date: '2026-03-01' }] },
    { materialId: 'BHN-006', materialName: 'Gula Pasir',    satuan: 'Kg',    stok: 2,   stokMin: 3,  harga: 14000, batches: [{ id: 'B6-003', qty: 2, buyPrice: 14000, date: '2026-03-01' }] },
  ],
  'dfda8a9c-7e8e-4a8e-9522-320e52e189d4': [],
};

export function getAllBranchStock(): Record<string, BranchStockItem[]> {
  try {
    const s = localStorage.getItem(STORAGE_KEYS.BRANCH_STOCK);
    return s ? JSON.parse(s) : { ...DEFAULT_BRANCH_STOCK };
  } catch { return { ...DEFAULT_BRANCH_STOCK }; }
}

export function getBranchStock(branchId: string): BranchStockItem[] {
  const all = getAllBranchStock();
  return all[branchId] ?? DEFAULT_BRANCH_STOCK[branchId] ?? [];
}

export function saveBranchStock(branchId: string, stock: BranchStockItem[]) {
  try {
    const all = getAllBranchStock();
    all[branchId] = stock;
    localStorage.setItem(STORAGE_KEYS.BRANCH_STOCK, JSON.stringify(all));
  } catch { /* ignore */ }
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export interface TxItem {
  productId:   string;
  productName: string;
  qty:         number;
  price:       number;   // harga jual
  hpp:         number;   // HPP per unit
  subtotal:    number;   // qty × price
  cogs:        number;   // qty × hpp
}

export interface POSTransaction {
  id:          string;
  date:        string;     // ISO string
  orderType:   OrderType;
  branchId:    string;
  branchName:  string;
  cashierName?: string;
  paymentMethod?: string;
  items:       TxItem[];
  subtotal:    number;
  tax:         number;
  discount:    number;
  total:       number;
  totalCOGS:   number;
  grossProfit: number;
}

export function getTransactions(): POSTransaction[] {
  try {
    const s = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

export function saveTransaction(tx: POSTransaction) {
  const all = getTransactions();
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([tx, ...all]));
}

// ─── POS Sessions ─────────────────────────────────────────────────────────────
// Setiap cabang bisa punya 1 sesi kasir aktif. Diperbarui dari POS app.

export interface POSSession {
  branchId:    string;
  branchName:  string;
  cashierName: string;
  loginAt:     string;  // ISO string
  active:      boolean; // false = shift sudah ditutup
}

export function getPOSSessions(): Record<string, POSSession> {
  try {
    const s = localStorage.getItem(STORAGE_KEYS.POS_SESSIONS);
    return s ? JSON.parse(s) : {};
  } catch { return {}; }
}

export function savePOSSession(branchId: string, branchName: string, cashierName: string) {
  try {
    const sessions = getPOSSessions();
    sessions[branchId] = { branchId, branchName, cashierName, loginAt: new Date().toISOString(), active: true };
    localStorage.setItem(STORAGE_KEYS.POS_SESSIONS, JSON.stringify(sessions));
  } catch { /* ignore */ }
}

export function clearPOSSession(branchId: string) {
  try {
    const sessions = getPOSSessions();
    if (sessions[branchId]) sessions[branchId] = { ...sessions[branchId], active: false };
    localStorage.setItem(STORAGE_KEYS.POS_SESSIONS, JSON.stringify(sessions));
  } catch { /* ignore */ }
}

// ─── Customers ────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
  lastVisit: string;
}

export function getCustomers(): Customer[] {
  try {
    const s = localStorage.getItem('warung_bujo_customers');
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

export function saveCustomers(customers: Customer[]) {
  localStorage.setItem('warung_bujo_customers', JSON.stringify(customers));
}

export function saveOrUpdateCustomer(c: Customer) {
  const all = getCustomers();
  const idx = all.findIndex(x => x.id === c.id);
  if (idx >= 0) all[idx] = c; else all.push(c);
  saveCustomers(all);
}

// ─── Voucher ──────────────────────────────────────────────────────────────────

export interface Voucher {
  id: string;
  code: string;
  description: string;
  type: 'fixed' | 'percentage';
  value: number;
  minOrder: number;
  maxDiscount: number;   // 0 = no cap
  expiry: string;        // YYYY-MM-DD
  usageLimit: number;    // 0 = unlimited
  usageCount: number;
  branchIds: string[];   // empty = all branches
  isActive: boolean;
  createdAt: string;
}

export const DEFAULT_VOUCHERS: Voucher[] = [
  {
    id: 'VCH-001', code: 'SELAMAT10', description: 'Diskon 10% untuk semua menu',
    type: 'percentage', value: 10, minOrder: 20000, maxDiscount: 15000,
    expiry: '2026-12-31', usageLimit: 100, usageCount: 12,
    branchIds: [], isActive: true, createdAt: '2026-01-01',
  },
  {
    id: 'VCH-002', code: 'HEMAT5K', description: 'Diskon Rp 5.000 min. belanja Rp 30.000',
    type: 'fixed', value: 5000, minOrder: 30000, maxDiscount: 0,
    expiry: '2026-06-30', usageLimit: 50, usageCount: 8,
    branchIds: ['dfda8a9c-7e8e-4a8e-9522-320e52e189d1', 'dfda8a9c-7e8e-4a8e-9522-320e52e189d2'], isActive: true, createdAt: '2026-01-15',
  },
  {
    id: 'VCH-003', code: 'GRANDBUKA', description: 'Gratis ongkir Rp 10.000',
    type: 'fixed', value: 10000, minOrder: 0, maxDiscount: 0,
    expiry: '2026-03-31', usageLimit: 200, usageCount: 187,
    branchIds: [], isActive: false, createdAt: '2026-03-01',
  },
];

export function getVouchers(): Voucher[] {
  try {
    const s = localStorage.getItem('warung_bujo_vouchers');
    return s ? JSON.parse(s) : [...DEFAULT_VOUCHERS];
  } catch { return [...DEFAULT_VOUCHERS]; }
}

export function saveVouchers(vouchers: Voucher[]) {
  localStorage.setItem('warung_bujo_vouchers', JSON.stringify(vouchers));
}

export function saveVoucher(v: Voucher) {
  const all = getVouchers();
  const idx = all.findIndex(x => x.id === v.id);
  if (idx >= 0) all[idx] = v; else all.push(v);
  saveVouchers(all);
}

export interface VoucherValidation {
  valid: boolean;
  voucher?: Voucher;
  discount: number;
  message: string;
}

export function validateVoucher(code: string, orderTotal: number, branchId: string): VoucherValidation {
  const vouchers = getVouchers();
  const v = vouchers.find(x => x.code.toUpperCase() === code.toUpperCase().trim());
  if (!v) return { valid: false, discount: 0, message: 'Kode voucher tidak ditemukan' };
  if (!v.isActive) return { valid: false, discount: 0, message: 'Voucher sudah tidak aktif' };
  if (new Date(v.expiry) < new Date()) return { valid: false, discount: 0, message: 'Voucher sudah kadaluarsa' };
  if (v.usageLimit > 0 && v.usageCount >= v.usageLimit) return { valid: false, discount: 0, message: 'Kuota voucher habis' };
  if (orderTotal < v.minOrder) return { valid: false, discount: 0, message: `Min. belanja Rp ${v.minOrder.toLocaleString('id-ID')}` };
  if (v.branchIds.length > 0 && !v.branchIds.includes(branchId)) return { valid: false, discount: 0, message: 'Voucher tidak berlaku di cabang ini' };
  const raw = v.type === 'fixed' ? v.value : Math.round(orderTotal * v.value / 100);
  const discount = v.maxDiscount > 0 ? Math.min(raw, v.maxDiscount) : raw;
  return { valid: true, voucher: v, discount, message: `Hemat Rp ${discount.toLocaleString('id-ID')}` };
}

export function incrementVoucherUsage(code: string) {
  const vouchers = getVouchers();
  const idx = vouchers.findIndex(v => v.code.toUpperCase() === code.toUpperCase());
  if (idx >= 0) { vouchers[idx].usageCount += 1; saveVouchers(vouchers); }
}

// ─── Loyalty Config ───────────────────────────────────────────────────────────

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  bonusMultiplier: number;
  colorClass: string;   // tailwind text class
  bgClass: string;      // tailwind bg class
  badgeColor: string;   // hex for inline style
}

export interface LoyaltyConfig {
  earnRate: number;     // 1 point per X Rp
  redeemRate: number;   // 1 point = Y Rp
  tiers: LoyaltyTier[];
}

export const DEFAULT_LOYALTY_CONFIG: LoyaltyConfig = {
  earnRate: 10000,
  redeemRate: 100,
  tiers: [
    { name: 'Bronze', minPoints: 0,    bonusMultiplier: 1.0, colorClass: 'text-amber-700',  bgClass: 'bg-amber-100',  badgeColor: '#d97706' },
    { name: 'Silver', minPoints: 500,  bonusMultiplier: 1.5, colorClass: 'text-slate-600',  bgClass: 'bg-slate-100',  badgeColor: '#64748b' },
    { name: 'Gold',   minPoints: 2000, bonusMultiplier: 2.0, colorClass: 'text-yellow-600', bgClass: 'bg-yellow-100', badgeColor: '#d97706' },
  ],
};

export function getLoyaltyConfig(): LoyaltyConfig {
  try {
    const s = localStorage.getItem('warung_bujo_loyalty_config');
    const saved = s ? JSON.parse(s) : null;
    return saved ? { ...DEFAULT_LOYALTY_CONFIG, ...saved } : { ...DEFAULT_LOYALTY_CONFIG };
  } catch { return { ...DEFAULT_LOYALTY_CONFIG }; }
}

export function saveLoyaltyConfig(config: LoyaltyConfig) {
  localStorage.setItem('warung_bujo_loyalty_config', JSON.stringify(config));
}

export function getCustomerTier(points: number, config: LoyaltyConfig): LoyaltyTier {
  const sorted = [...config.tiers].sort((a, b) => b.minPoints - a.minPoints);
  return sorted.find(t => points >= t.minPoints) ?? config.tiers[0];
}

export function calcPointsEarned(total: number, config: LoyaltyConfig): number {
  return Math.floor(total / config.earnRate);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/** Kompres gambar ke JPEG max 800px, quality 82% */
export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = ev => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = ev.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ─── Finance Accounts ─────────────────────────────────────────────────────────

export interface Account {
  id: string;
  code: string;
  name: string;
  category: 'Aset' | 'Kewajiban' | 'Modal' | 'Pendapatan' | 'HPP' | 'Beban';
  subCategory: string;
  balance: number;
}

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: '1', code: '1101', name: 'Kas', category: 'Aset', subCategory: 'Aset Lancar', balance: 0 },
  { id: '2', code: '1102', name: 'Bank', category: 'Aset', subCategory: 'Aset Lancar', balance: 0 },
  { id: '3', code: '1201', name: 'Piutang Usaha', category: 'Aset', subCategory: 'Aset Lancar', balance: 0 },
  { id: '4', code: '1301', name: 'Stok Bahan Baku', category: 'Aset', subCategory: 'Persediaan', balance: 0 },
  { id: '5', code: '2101', name: 'Hutang Dagang', category: 'Kewajiban', subCategory: 'Kewajiban Lancar', balance: 0 },
  { id: '6', code: '3101', name: 'Modal Disetor', category: 'Modal', subCategory: 'Ekuitas', balance: 0 },
  { id: '7', code: '3201', name: 'Laba Ditahan', category: 'Modal', subCategory: 'Ekuitas', balance: 0 },
  { id: '8', code: '4101', name: 'Penjualan Food & Beverage', category: 'Pendapatan', subCategory: 'Pendapatan Operasional', balance: 0 },
  { id: '9', code: '5101', name: 'Beban Bahan Baku', category: 'HPP', subCategory: 'HPP', balance: 0 },
  { id: '13', code: '5102', name: 'Selisih Fluktuatif Bahan Baku', category: 'HPP', subCategory: 'HPP', balance: 0 },
  { id: '10', code: '6101', name: 'Gaji Karyawan', category: 'Beban', subCategory: 'Beban Operasional', balance: 0 },
  { id: '11', code: '6102', name: 'Sewa Tempat', category: 'Beban', subCategory: 'Beban Operasional', balance: 0 },
  { id: '12', code: '6103', name: 'Listrik / Air', category: 'Beban', subCategory: 'Beban Operasional', balance: 0 },
];

export function loadAccounts(): Account[] {
  try {
    const s = localStorage.getItem(STORAGE_KEYS.ACCOUNTS || 'warung_bujo_accounts');
    return s ? JSON.parse(s) : [...DEFAULT_ACCOUNTS];
  } catch { return [...DEFAULT_ACCOUNTS]; }
}

export function saveAccounts(accounts: Account[]) {
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS || 'warung_bujo_accounts', JSON.stringify(accounts));
}

// ─── Transfer History ──────────────────────────────────────────────────────────

export interface TransferHistory {
  id: string;
  date: string;
  fromBranchId: string;
  toBranchId: string;
  notes: string;
  items: {
    materialId: string;
    materialName: string;
    qty: number;
    unit: string;
  }[];
}

export function getTransfers(): TransferHistory[] {
  try {
    const s = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

export function saveTransfers(transfers: TransferHistory[]) {
  localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
}

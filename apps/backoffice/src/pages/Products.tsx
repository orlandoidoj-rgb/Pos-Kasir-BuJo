import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package, Plus, Search, Edit2, Eye, EyeOff, X, Store,
  ShoppingBag, Filter, CheckCircle2, Trash2, Tag, UploadCloud,
  FolderOpen, Image as ImageIcon, ChevronDown, ChevronRight,
  Calculator, BookOpen, RefreshCw,
} from 'lucide-react';
import {
  STORAGE_KEYS, ORDER_TYPES, ORDER_TYPE_META,
  MasterProduct, ProductPrices, BOMLine,
  slugify, compressImage, calculateHPP, getMaterialPrices, getBOM,
} from '../lib/storage';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export { STORAGE_KEYS };

export const CATEGORIES = [
  { id: '1', name: 'Menu Utama'  },
  { id: '2', name: 'Tambahan'   },
  { id: '3', name: 'Minuman'    },
  { id: '4', name: 'Paket Hemat'},
];

const emptyPrices = (): ProductPrices => ({
  'Dine-in': 0, 'Take-away': 0, 'Shopee': 0, 'Grab': 0, 'Gofood': 0,
});

const UNITS = ['Porsi', 'Pcs', 'Gelas', 'Set', 'Kg', 'Liter', 'Kotak'];

// ─────────────────────────────────────────────────────────────────────────────
// Default products
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_BRANCH_ACTIVATIONS = { 'CBG-001': true, 'CBG-002': true, 'CBG-003': true, 'CBG-004': false };

const DEFAULT_PRODUCTS: MasterProduct[] = [
  {
    id: 'PRD-001', name: 'Ayam Penyet Lalapan', categoryId: '1', unit: 'Porsi',
    prices: { 'Dine-in': 25000, 'Take-away': 25000, 'Shopee': 27000, 'Grab': 27000, 'Gofood': 27000 },
    purchasePrice: 0, isSellable: true, isActive: true,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=800&auto=format&fit=crop',
    imagePath: 'menu-utama/ayam-penyet-lalapan',
    branchActivations: { ...DEFAULT_BRANCH_ACTIVATIONS },
  },
  {
    id: 'PRD-002', name: 'Bebek Bakar Madu', categoryId: '1', unit: 'Porsi',
    prices: { 'Dine-in': 35000, 'Take-away': 35000, 'Shopee': 38000, 'Grab': 38000, 'Gofood': 38000 },
    purchasePrice: 0, isSellable: true, isActive: true,
    image: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?q=80&w=800&auto=format&fit=crop',
    imagePath: 'menu-utama/bebek-bakar-madu',
    branchActivations: { ...DEFAULT_BRANCH_ACTIVATIONS },
  },
  {
    id: 'PRD-003', name: 'Lele Goreng Crispy', categoryId: '1', unit: 'Porsi',
    prices: { 'Dine-in': 18000, 'Take-away': 18000, 'Shopee': 20000, 'Grab': 20000, 'Gofood': 20000 },
    purchasePrice: 0, isSellable: true, isActive: true,
    image: 'https://images.unsplash.com/photo-1598511726623-d3455a1d713c?q=80&w=800&auto=format&fit=crop',
    imagePath: 'menu-utama/lele-goreng-crispy',
    branchActivations: { ...DEFAULT_BRANCH_ACTIVATIONS },
  },
  {
    id: 'PRD-004', name: 'Nasi Goreng Spesial', categoryId: '1', unit: 'Porsi',
    prices: { 'Dine-in': 22000, 'Take-away': 22000, 'Shopee': 24000, 'Grab': 24000, 'Gofood': 24000 },
    purchasePrice: 0, isSellable: true, isActive: true,
    image: 'https://images.unsplash.com/photo-1562802378-063ec186a863?q=80&w=800&auto=format&fit=crop',
    imagePath: 'menu-utama/nasi-goreng-spesial',
    branchActivations: { ...DEFAULT_BRANCH_ACTIVATIONS },
  },
  {
    id: 'PRD-005', name: 'Tempe & Tahu Bacem', categoryId: '2', unit: 'Porsi',
    prices: { 'Dine-in': 8000, 'Take-away': 8000, 'Shopee': 9000, 'Grab': 9000, 'Gofood': 9000 },
    purchasePrice: 3000, isSellable: true, isActive: true,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    imagePath: 'tambahan/tempe-tahu-bacem',
    branchActivations: { ...DEFAULT_BRANCH_ACTIVATIONS },
  },
  {
    id: 'PRD-006', name: 'Kerupuk Udang', categoryId: '2', unit: 'Pcs',
    prices: { 'Dine-in': 3000, 'Take-away': 3000, 'Shopee': 4000, 'Grab': 4000, 'Gofood': 4000 },
    purchasePrice: 800, isSellable: true, isActive: true,
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=80&w=800&auto=format&fit=crop',
    imagePath: 'tambahan/kerupuk-udang',
    branchActivations: { ...DEFAULT_BRANCH_ACTIVATIONS },
  },
  {
    id: 'PRD-007', name: 'Es Teh Manis Jumbo', categoryId: '3', unit: 'Gelas',
    prices: { 'Dine-in': 5000, 'Take-away': 5000, 'Shopee': 6000, 'Grab': 6000, 'Gofood': 6000 },
    purchasePrice: 0, isSellable: true, isActive: true,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop',
    imagePath: 'minuman/es-teh-manis-jumbo',
    branchActivations: { ...DEFAULT_BRANCH_ACTIVATIONS },
  },
  {
    id: 'PRD-008', name: 'Es Jeruk Nipis', categoryId: '3', unit: 'Gelas',
    prices: { 'Dine-in': 7000, 'Take-away': 7000, 'Shopee': 8000, 'Grab': 8000, 'Gofood': 8000 },
    purchasePrice: 0, isSellable: true, isActive: true,
    image: 'https://images.unsplash.com/photo-1621236378699-8597faa64b0f?q=80&w=800&auto=format&fit=crop',
    imagePath: 'minuman/es-jeruk-nipis',
    branchActivations: { ...DEFAULT_BRANCH_ACTIVATIONS },
  },
  {
    id: 'PRD-009', name: 'Paket Hemat A (Ayam + Nasi)', categoryId: '4', unit: 'Set',
    prices: { 'Dine-in': 33000, 'Take-away': 33000, 'Shopee': 36000, 'Grab': 36000, 'Gofood': 36000 },
    purchasePrice: 0, isSellable: true, isActive: true,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop',
    imagePath: 'paket-hemat/paket-hemat-a-ayam-nasi',
    branchActivations: { ...DEFAULT_BRANCH_ACTIVATIONS },
  },
  {
    id: 'PRD-010', name: 'Paket Hemat B (Lele + Minuman)', categoryId: '4', unit: 'Set',
    prices: { 'Dine-in': 22000, 'Take-away': 22000, 'Shopee': 24000, 'Grab': 24000, 'Gofood': 24000 },
    purchasePrice: 0, isSellable: true, isActive: false,
    image: 'https://images.unsplash.com/photo-1567364816519-cbc9c4ffe1eb?q=80&w=800&auto=format&fit=crop',
    imagePath: 'paket-hemat/paket-hemat-b-lele-minuman',
    branchActivations: { ...DEFAULT_BRANCH_ACTIVATIONS },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────────────────────────────────────

function migrateProduct(raw: any): MasterProduct {
  const base = raw.prices ? raw : {
    ...raw,
    prices: { 'Dine-in': raw.price ?? 0, 'Take-away': raw.price ?? 0, 'Shopee': Math.round((raw.price ?? 0) * 1.08), 'Grab': Math.round((raw.price ?? 0) * 1.08), 'Gofood': Math.round((raw.price ?? 0) * 1.08) },
    imagePath: raw.imagePath ?? `${slugify(CATEGORIES.find((c: {id:string}) => c.id === raw.categoryId)?.name ?? 'lainnya')}/${slugify(raw.name)}`,
  };
  // Ensure branchActivations exists
  if (!base.branchActivations) base.branchActivations = { 'CBG-001': true };
  return base as MasterProduct;
}

function loadProducts(): MasterProduct[] {
  try {
    const s = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (s) return (JSON.parse(s) as any[]).map(migrateProduct);
  } catch { /* ignore */ }
  return DEFAULT_PRODUCTS.map(p => ({
    ...p,
    purchasePrice: calculateHPP(p.id).total || p.purchasePrice,
  }));
}

function saveProducts(products: MasterProduct[]) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductModal
// ─────────────────────────────────────────────────────────────────────────────

interface FormState {
  name:          string;
  prices:        ProductPrices;
  purchasePrice: number;
  categoryId:    string;
  image:         string;
  imagePath:     string;
  unit:          string;
  isSellable:    boolean;
  isActive:      boolean;
}

function buildFormState(p: MasterProduct | null, categoryId = '1'): FormState {
  if (!p) return {
    name: '', prices: emptyPrices(), purchasePrice: 0,
    categoryId, image: '', imagePath: '', unit: 'Porsi',
    isSellable: true, isActive: true,
  };
  return { name: p.name, prices: { ...p.prices }, purchasePrice: p.purchasePrice, categoryId: p.categoryId, image: p.image, imagePath: p.imagePath, unit: p.unit, isSellable: p.isSellable, isActive: p.isActive };
}

function ProductModal({ initial, onSave, onClose }: {
  initial: MasterProduct | null;
  onSave: (p: MasterProduct) => void;
  onClose: () => void;
}) {
  const isEdit = initial !== null;
  const [form, setForm] = useState<FormState>(buildFormState(initial));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [bomDetail, setBomDetail] = useState<ReturnType<typeof calculateHPP> | null>(null);
  const [showBOM, setShowBOM] = useState(false);
  const [hppTab, setHppTab] = useState<'manual' | 'auto'>('auto');
  const fileRef = useRef<HTMLInputElement>(null);

  // Hitung HPP dari BOM saat produk dimuat
  useEffect(() => {
    const productId = initial?.id ?? '';
    const result = calculateHPP(productId);
    setBomDetail(result);
    if (result.total > 0 && hppTab === 'auto') {
      setForm(f => ({ ...f, purchasePrice: result.total }));
    }
  }, [initial?.id]);

  // Auto-update imagePath saat nama/kategori berubah
  useEffect(() => {
    if (!form.name) return;
    const catName = CATEGORIES.find(c => c.id === form.categoryId)?.name ?? 'lainnya';
    setForm(f => ({ ...f, imagePath: `${slugify(catName)}/${slugify(f.name)}` }));
  }, [form.name, form.categoryId]);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const setPrice = (type: keyof ProductPrices, val: number) =>
    setForm(f => ({ ...f, prices: { ...f.prices, [type]: val } }));

  // Saat Dine-in diubah, tawarkan fill otomatis ke type lain jika masih 0
  const handleDineInChange = (val: number) => {
    setForm(f => {
      const prices = { ...f.prices, 'Dine-in': val };
      if (prices['Take-away'] === 0) prices['Take-away'] = val;
      if (prices['Shopee'] === 0)    prices['Shopee']    = Math.round(val * 1.08);
      if (prices['Grab'] === 0)      prices['Grab']      = Math.round(val * 1.08);
      if (prices['Gofood'] === 0)    prices['Gofood']    = Math.round(val * 1.08);
      return { ...f, prices };
    });
  };

  const handleFile = useCallback(async (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const b64 = await compressImage(file);
      setForm(f => ({ ...f, image: b64 }));
    } finally { setUploading(false); }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    handleFile(e.dataTransfer.files[0] ?? null);
  }, [handleFile]);

  const refreshHPP = () => {
    const id = initial?.id ?? '';
    const r = calculateHPP(id);
    setBomDetail(r);
    if (r.total > 0) setForm(f => ({ ...f, purchasePrice: r.total }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Nama produk wajib diisi';
    if (form.prices['Dine-in'] <= 0) e.prices = 'Harga Dine-in harus > 0';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const id = initial?.id ?? `PRD-${String(Date.now()).slice(-6)}`;
    onSave({ id, ...form, branchActivations: initial?.branchActivations ?? { 'CBG-001': true } });
  };

  const catName = CATEGORIES.find(c => c.id === form.categoryId)?.name ?? '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[680px] max-h-[92vh] overflow-y-auto border border-slate-200 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Package size={17} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">{isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
              {form.imagePath && <p className="text-[11px] text-slate-400 font-mono">{form.imagePath}/</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"><X size={17} /></button>
        </div>

        <div className="p-6 space-y-5 flex-1">
          {/* ── Upload Foto ── */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Foto Produk
              {form.imagePath && (
                <span className="ml-2 font-mono text-indigo-500 normal-case tracking-normal">
                  <FolderOpen size={10} className="inline mr-1" />{form.imagePath}/
                </span>
              )}
            </label>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative w-full h-44 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              {form.image ? (
                <>
                  <img
                    src={form.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={e => e.currentTarget.remove()}
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <UploadCloud size={24} className="text-white mb-1" />
                    <span className="text-white text-xs font-semibold">Ganti Foto</span>
                  </div>
                </>
              ) : (
                uploading ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <RefreshCw size={24} className="animate-spin" />
                    <span className="text-xs">Mengompres foto...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <UploadCloud size={28} className="text-slate-300" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-600">Klik atau drag foto ke sini</p>
                      <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WEBP · Disimpan di <span className="font-mono text-indigo-500">{form.imagePath || `${slugify(catName)}/${slugify(form.name || 'produk')}`}/</span></p>
                    </div>
                  </div>
                )
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {/* ── Nama + Kategori + Satuan ── */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Produk *</label>
              <input
                autoFocus
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Ayam Goreng Spesial"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-indigo-400'}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kategori</label>
              <select
                value={form.categoryId}
                onChange={e => set('categoryId', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-all"
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Satuan</label>
              <select
                value={form.unit}
                onChange={e => set('unit', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-all"
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* ── Harga per Tipe Transaksi ── */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Harga Jual per Tipe Transaksi
              <span className="ml-2 text-indigo-500 font-normal normal-case tracking-normal">
                — otomatis ke POS & Laporan Keuangan
              </span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ORDER_TYPES.map(type => {
                const meta = ORDER_TYPE_META[type];
                return (
                  <div key={type} className={`rounded-xl border-2 p-3 space-y-1.5 ${
                    errors.prices && type === 'Dine-in' ? 'border-red-300' : 'border-slate-100'
                  }`}>
                    <div className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg text-center ${meta.bg} ${meta.textColor}`}>
                      {meta.label}
                    </div>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">Rp</span>
                      <input
                        type="number"
                        min="0"
                        value={form.prices[type] || ''}
                        onChange={e => {
                          const v = Number(e.target.value);
                          if (type === 'Dine-in') handleDineInChange(v);
                          else setPrice(type, v);
                        }}
                        className="w-full border border-slate-200 rounded-lg pl-7 pr-2 py-1.5 text-xs text-slate-800 font-bold outline-none focus:border-indigo-400 transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.prices && <p className="text-xs text-red-500 mt-1">{errors.prices}</p>}
            <p className="text-[11px] text-slate-400 mt-1.5">
              Tip: Isi Dine-in dulu — harga online (Shopee/Grab/GoFood) otomatis diisi +8%
            </p>
          </div>

          {/* ── HPP / Biaya Produksi ── */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calculator size={15} className="text-indigo-600" />
                <span className="text-sm font-bold text-slate-700">HPP / Biaya Produksi</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHppTab('auto')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${hppTab === 'auto' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Auto dari BOM
                </button>
                <button
                  onClick={() => setHppTab('manual')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${hppTab === 'manual' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Manual
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {hppTab === 'auto' ? (
                <>
                  {bomDetail && bomDetail.lines.length > 0 ? (
                    <>
                      <div className="space-y-1.5">
                        {bomDetail.lines.map((l, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">
                              {l.name} · {l.qty} {l.unit} × Rp {l.unitPrice.toLocaleString('id-ID')}
                            </span>
                            <span className="font-bold text-slate-800">Rp {l.cost.toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                        <span className="text-sm font-bold text-slate-700">Total HPP / Porsi</span>
                        <span className="text-base font-black text-indigo-700">Rp {bomDetail.total.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={refreshHPP}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-all"
                        >
                          <RefreshCw size={11} /> Refresh dari Harga Bahan Terbaru
                        </button>
                        <button
                          onClick={() => setShowBOM(!showBOM)}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-all"
                        >
                          <BookOpen size={11} />
                          {showBOM ? 'Sembunyikan' : 'Lihat'} Resep
                          {showBOM ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-400 py-2">
                      Belum ada resep (BOM) untuk produk ini. Atur resep di menu <strong>Inventory → Resep / BOM</strong> atau gunakan input Manual.
                    </p>
                  )}
                  <input type="hidden" readOnly value={form.purchasePrice} />
                </>
              ) : (
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">HPP Manual (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.purchasePrice || ''}
                    onChange={e => set('purchasePrice', Number(e.target.value))}
                    placeholder="0"
                    className="w-48 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-all"
                  />
                </div>
              )}

              {/* Margin info */}
              {form.prices['Dine-in'] > 0 && form.purchasePrice > 0 && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div>
                    <span className="text-xs text-emerald-700 font-semibold">Margin Dine-in: </span>
                    <span className="text-sm font-black text-emerald-800">
                      {Math.round(((form.prices['Dine-in'] - form.purchasePrice) / form.prices['Dine-in']) * 100)}%
                    </span>
                    <span className="text-xs text-emerald-600 ml-2">
                      (Rp {(form.prices['Dine-in'] - form.purchasePrice).toLocaleString('id-ID')} / porsi)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Toggle Status ── */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'isSellable' as const, label: 'Tampil di POS', sub: 'Kasir dapat memilih produk ini', color: 'bg-indigo-600' },
              { key: 'isActive'   as const, label: 'Produk Aktif',  sub: 'Produk tersedia untuk dijual',   color: 'bg-emerald-500' },
            ].map(({ key, label, sub, color }) => (
              <label key={key} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-200 transition-all">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                </div>
                <div
                  onClick={() => set(key, !form[key])}
                  className={`w-11 h-6 rounded-full transition-all relative ${form[key] ? color : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form[key] ? 'left-6' : 'left-1'}`} />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60 sticky bottom-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Store size={11} />
            Tersimpan di <span className="font-mono text-indigo-500">{form.imagePath || '...'}/</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all">Batal</button>
            <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm shadow-indigo-200 active:scale-95 transition-all">
              {isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Galeri Folder Virtual
// ─────────────────────────────────────────────────────────────────────────────

function MediaGallery({ products }: { products: MasterProduct[] }) {
  const [openFolder, setOpenFolder] = useState<string | null>(null);

  const byCategory = CATEGORIES.map(cat => ({
    cat,
    items: products.filter(p => p.categoryId === cat.id && p.image),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
        <FolderOpen size={13} className="text-indigo-500" />
        <span className="font-mono">warung-bujo / foto-produk /</span>
        <span className="text-slate-400">— Foto dikompresi otomatis &amp; diorganisir per kategori</span>
      </div>
      {byCategory.map(({ cat, items }) => {
        const slug = slugify(cat.name);
        const isOpen = openFolder === slug;
        return (
          <div key={cat.id} className="glass-card overflow-hidden">
            <button
              onClick={() => setOpenFolder(isOpen ? null : slug)}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors"
            >
              <FolderOpen size={17} className="text-amber-500" />
              <span className="font-mono text-sm font-semibold text-slate-700">{slug}/</span>
              <span className="text-xs text-slate-400">{items.length} foto</span>
              <ChevronDown size={14} className={`ml-auto text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="border-t border-slate-100 px-5 py-4 grid grid-cols-4 gap-4">
                {items.map(p => (
                  <div key={p.id} className="space-y-1.5">
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={e => e.currentTarget.remove()} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-slate-300" /></div>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 leading-tight truncate">{slugify(p.name)}.jpg</p>
                    <p className="text-[10px] text-slate-400 truncate">{p.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

type PageTab = 'list' | 'gallery';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<MasterProduct[]>(loadProducts);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [pageTab, setPageTab] = useState<PageTab>('list');
  const [modalTarget, setModalTarget] = useState<MasterProduct | null | 'new'>(undefined as any);

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      setModalTarget('new');
      setSearchParams({}, { replace: true });
    }
  }, []);

  // Recalculate HPP for all products from latest material prices
  const recalcAllHPP = () => {
    const updated = products.map(p => {
      const r = calculateHPP(p.id);
      if (r.total > 0) return { ...p, purchasePrice: r.total };
      return p;
    });
    setProducts(updated);
    saveProducts(updated);
  };

  const update = (next: MasterProduct[]) => { setProducts(next); saveProducts(next); };

  const handleSave = (p: MasterProduct) => {
    update(products.find(x => x.id === p.id) ? products.map(x => x.id === p.id ? p : x) : [...products, p]);
    setModalTarget(undefined as any);
  };

  const toggleActive = (id: string) =>
    update(products.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));

  const handleDelete = (id: string) => {
    if (!confirm('Hapus produk ini?')) return;
    update(products.filter(p => p.id !== id));
  };

  const filtered = products.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === 'all' || p.categoryId === catFilter;
    const mst = statusFilter === 'all' || (statusFilter === 'active' ? p.isActive : !p.isActive);
    return ms && mc && mst;
  });

  const posCount    = products.filter(p => p.isSellable && p.isActive).length;
  const activeCount = products.filter(p => p.isActive).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Page tab */}
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-1">
            <button onClick={() => setPageTab('list')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${pageTab === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
              Katalog
            </button>
            <button onClick={() => setPageTab('gallery')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${pageTab === 'gallery' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
              <FolderOpen size={12} /> Galeri Foto
            </button>
          </div>
          {pageTab === 'list' && (
            <>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..."
                  className="bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-sm outline-none focus:border-indigo-400 w-44 placeholder:text-slate-400" />
              </div>
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                <button onClick={() => setCatFilter('all')} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${catFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Semua</button>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setCatFilter(c.id)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${catFilter === c.id ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{c.name}</button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={recalcAllHPP} title="Recalculate HPP dari harga bahan terbaru"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all">
            <RefreshCw size={13} /> Recalc HPP
          </button>
          <button onClick={() => setModalTarget('new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm shadow-indigo-200 active:scale-95 transition-all">
            <Plus size={16} /> Tambah Produk
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Produk', value: products.length, icon: Package,       color: 'indigo' },
          { label: 'Aktif',        value: activeCount,     icon: CheckCircle2,  color: 'emerald' },
          { label: 'Aktif di POS', value: posCount,        icon: Store,         color: 'amber'   },
          { label: 'Ditampilkan',  value: filtered.length, icon: Filter,        color: 'slate'   },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 bg-${color}-50 rounded-xl flex items-center justify-center shrink-0`}>
              <Icon size={17} className={`text-${color}-600`} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
              <p className={`text-2xl font-black text-${color}-700`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sync Banner */}
      <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
        <p className="text-sm text-emerald-800">
          <strong>Live sync ke POS Kasir</strong> — Harga per tipe transaksi &amp; status produk langsung terbaca di POS.
          <span className="ml-1 text-emerald-700">{posCount} produk aktif.</span>
        </p>
      </div>

      {/* Gallery Tab */}
      {pageTab === 'gallery' && <MediaGallery products={products} />}

      {/* List Tab */}
      {pageTab === 'list' && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800">Katalog Produk</h3>
              <p className="text-xs text-slate-500 mt-0.5">{filtered.length} produk</p>
            </div>
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
              {(['all', 'active', 'inactive'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${statusFilter === s ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
                  {s === 'all' ? 'Semua' : s === 'active' ? 'Aktif' : 'Nonaktif'}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Produk', 'Kategori', 'Dine-in', 'T-Away', 'Online', 'HPP', 'Margin', 'POS', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => {
                  const cat    = CATEGORIES.find(c => c.id === p.categoryId);
                  const margin = p.prices['Dine-in'] > 0 && p.purchasePrice > 0
                    ? Math.round(((p.prices['Dine-in'] - p.purchasePrice) / p.prices['Dine-in']) * 100)
                    : null;
                  const onlineAvg = Math.round((p.prices['Shopee'] + p.prices['Grab'] + p.prices['Gofood']) / 3);
                  return (
                    <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${!p.isActive ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            {p.image
                              ? <img src={p.image} alt="" className="w-full h-full object-cover" onError={e => e.currentTarget.remove()} />
                              : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={12} className="text-slate-300" /></div>
                            }
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm leading-tight">{p.name}</p>
                            <p className="text-[10px] font-mono text-slate-400">{p.id} · {p.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold rounded-full">
                          <Tag size={8} className="inline mr-0.5" />{cat?.name ?? '–'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-800">
                        Rp {p.prices['Dine-in'].toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        Rp {p.prices['Take-away'].toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        <span title={`Shopee: ${p.prices['Shopee'].toLocaleString()} | Grab: ${p.prices['Grab'].toLocaleString()} | GoFood: ${p.prices['Gofood'].toLocaleString()}`} className="cursor-help">
                          ~Rp {onlineAvg.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {p.purchasePrice > 0 ? `Rp ${p.purchasePrice.toLocaleString('id-ID')}` : '–'}
                      </td>
                      <td className="px-4 py-3">
                        {margin !== null ? (
                          <span className={`text-sm font-bold ${margin >= 30 ? 'text-emerald-600' : margin >= 15 ? 'text-amber-600' : 'text-red-600'}`}>
                            {margin}%
                          </span>
                        ) : '–'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          p.isSellable && p.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {p.isSellable && p.isActive ? 'Live' : 'Off'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(p.id)} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                          p.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                        }`}>
                          {p.isActive ? <><Eye size={8} className="inline" /> Aktif</> : <><EyeOff size={8} className="inline" /> Off</>}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setModalTarget(p)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-all">
                            <Edit2 size={11} /> Edit
                          </button>
                          <button onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="px-5 py-12 text-center text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Tidak ada produk.</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {(modalTarget === 'new' || (modalTarget && typeof modalTarget === 'object')) && (
        <ProductModal
          initial={modalTarget === 'new' ? null : modalTarget}
          onSave={handleSave}
          onClose={() => setModalTarget(undefined as any)}
        />
      )}
    </div>
  );
}

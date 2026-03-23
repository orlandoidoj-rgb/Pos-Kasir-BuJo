import { useState } from 'react';
import {
  Package, BookOpen, AlertTriangle, Plus, Search, ChevronDown, Info,
  ShoppingCart, Send, BarChart3, Trash2, CheckCircle, Truck,
  Building2, ArrowRight, Filter, Warehouse, Calculator, X,
} from 'lucide-react';
import { saveMaterialPrice, getMaterialPrices, DEFAULT_MATERIAL_PRICES, getBranchStock, saveBranchStock } from '../lib/storage';
import type { BranchStockItem } from '../lib/storage';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'bahan' | 'bom' | 'pengadaan' | 'distribusi';

interface StockEntry {
  id: string;
  nama: string;
  satuan: string;
  stok: number;
  stokMin: number;
  harga: number;
  branchId: string;
  branchName: string;
}

interface BOMItem {
  idBahan: string;
  namaBahan: string;
  satuan: string;
  qtyPerPorsi: number;
}

interface Recipe {
  id: string;
  namaProduk: string;
  kategori: string;
  bahan: BOMItem[];
  hppPerPorsi: number;
}

interface PurchaseLine {
  key: number;
  productId: string;
  productName: string;
  qty: string;
  totalAmount: string; // total harga bayar (input user)
  unitPrice: string;   // auto = totalAmount / qty (tampil read-only)
}

interface TransferLine {
  key: number;
  productId: string;
  productName: string;
  availableQty: number;
  qty: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const branches = [
  { id: 'CBG-001', name: 'Malang Pusat', isPrimary: true },
  { id: 'CBG-002', name: 'Malang Kayutangan', isPrimary: false },
  { id: 'CBG-003', name: 'Surabaya Barat', isPrimary: false },
  { id: 'CBG-004', name: 'Jakarta Selatan', isPrimary: false },
];

const suppliers = [
  { id: 'SUP-001', name: 'CV Mitra Pangan' },
  { id: 'SUP-002', name: 'UD Sumber Hasil' },
  { id: 'SUP-003', name: 'PT Agro Nusantara' },
];

const rawMaterialOptions = [
  { id: 'BHN-001', name: 'Beras Pandan', unit: 'Kg', purchasePrice: 12000 },
  { id: 'BHN-002', name: 'Ayam Fillet', unit: 'Kg', purchasePrice: 45000 },
  { id: 'BHN-003', name: 'Minyak Goreng', unit: 'Liter', purchasePrice: 18000 },
  { id: 'BHN-004', name: 'Garam Halus', unit: 'Kg', purchasePrice: 5000 },
  { id: 'BHN-005', name: 'Teh Celup', unit: 'Kotak', purchasePrice: 8500 },
  { id: 'BHN-006', name: 'Gula Pasir', unit: 'Kg', purchasePrice: 14000 },
  { id: 'BHN-007', name: 'Sambal Terasi', unit: 'Kg', purchasePrice: 25000 },
  { id: 'BHN-008', name: 'Tepung Terigu', unit: 'Kg', purchasePrice: 9000 },
];

// Helper: load stock for all branches as flat StockEntry[]
function loadAllStockData(): StockEntry[] {
  return branches.flatMap(b => {
    const items: BranchStockItem[] = getBranchStock(b.id);
    return items.map(item => ({
      id: item.materialId,
      nama: item.materialName,
      satuan: item.satuan,
      stok: item.stok,
      stokMin: item.stokMin,
      harga: item.harga,
      branchId: b.id,
      branchName: b.name,
    }));
  });
}

const recipes: Recipe[] = [
  {
    id: 'PRD-001', namaProduk: 'Ayam Goreng', kategori: 'Main Course', hppPerPorsi: 11750,
    bahan: [
      { idBahan: 'BHN-002', namaBahan: 'Ayam Fillet',   satuan: 'Kg',    qtyPerPorsi: 0.2 },
      { idBahan: 'BHN-001', namaBahan: 'Beras Pandan',  satuan: 'Kg',    qtyPerPorsi: 0.15 },
      { idBahan: 'BHN-003', namaBahan: 'Minyak Goreng', satuan: 'Liter', qtyPerPorsi: 0.05 },
      { idBahan: 'BHN-004', namaBahan: 'Garam Halus',   satuan: 'Kg',    qtyPerPorsi: 0.005 },
    ],
  },
  {
    id: 'PRD-002', namaProduk: 'Es Teh Manis', kategori: 'Minuman', hppPerPorsi: 850,
    bahan: [
      { idBahan: 'BHN-005', namaBahan: 'Teh Celup',   satuan: 'Pcs', qtyPerPorsi: 1 },
      { idBahan: 'BHN-006', namaBahan: 'Gula Pasir',  satuan: 'Kg',  qtyPerPorsi: 0.025 },
    ],
  },
  {
    id: 'PRD-003', namaProduk: 'Nasi Goreng', kategori: 'Main Course', hppPerPorsi: 8200,
    bahan: [
      { idBahan: 'BHN-001', namaBahan: 'Beras Pandan',  satuan: 'Kg',    qtyPerPorsi: 0.2 },
      { idBahan: 'BHN-003', namaBahan: 'Minyak Goreng', satuan: 'Liter', qtyPerPorsi: 0.03 },
      { idBahan: 'BHN-004', namaBahan: 'Garam Halus',   satuan: 'Kg',    qtyPerPorsi: 0.003 },
      { idBahan: 'BHN-006', namaBahan: 'Gula Pasir',    satuan: 'Kg',    qtyPerPorsi: 0.005 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StokBadge({ stok, stokMin }: { stok: number; stokMin: number }) {
  if (stok <= stokMin * 0.5) return (
    <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold rounded-full">
      <AlertTriangle size={10} /> Kritis
    </span>
  );
  if (stok <= stokMin) return (
    <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold rounded-full">
      <AlertTriangle size={10} /> Low Stock
    </span>
  );
  return (
    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-full">
      Aman
    </span>
  );
}

function StokBar({ stok, stokMin }: { stok: number; stokMin: number }) {
  const pct = Math.min((stok / (stokMin * 3)) * 100, 100);
  const color = stok <= stokMin * 0.5 ? 'bg-red-500' : stok <= stokMin ? 'bg-amber-400' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-bold ${stok <= stokMin ? 'text-red-600' : 'text-slate-800'}`}>
        {stok}
      </span>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
        active
          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
          : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
      }`}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Dashboard (Inventory Slicer)
// ─────────────────────────────────────────────────────────────────────────────

function DashboardTab() {
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  const stockData = loadAllStockData();
  const filtered = selectedBranch === 'all'
    ? stockData
    : stockData.filter(s => s.branchId === selectedBranch);

  const total = filtered.length;
  const aman = filtered.filter(s => s.stok > s.stokMin).length;
  const lowStock = filtered.filter(s => s.stok <= s.stokMin && s.stok > s.stokMin * 0.5).length;
  const kritis = filtered.filter(s => s.stok <= s.stokMin * 0.5).length;

  return (
    <div className="space-y-5">
      {/* Slicer */}
      <div className="glass-card p-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Filter size={15} className="text-indigo-500" />
          Filter Cabang:
        </div>
        <button
          onClick={() => setSelectedBranch('all')}
          className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
            selectedBranch === 'all'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
          }`}
        >
          Konsolidasi (Semua)
        </button>
        {branches.map(b => (
          <button
            key={b.id}
            onClick={() => setSelectedBranch(b.id)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all flex items-center gap-1.5 ${
              selectedBranch === b.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {b.isPrimary ? <Warehouse size={13} /> : <Building2 size={13} />}
            {b.name}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Item', value: total, color: 'indigo', icon: Package },
          { label: 'Stok Aman', value: aman, color: 'emerald', icon: CheckCircle },
          { label: 'Low Stock', value: lowStock, color: 'amber', icon: AlertTriangle },
          { label: 'Kritis', value: kritis, color: 'red', icon: AlertTriangle },
        ].map(card => (
          <div key={card.label} className="glass-card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
              <div className={`p-1.5 rounded-lg bg-${card.color}-50`}>
                <card.icon size={14} className={`text-${card.color}-600`} />
              </div>
            </div>
            <p className={`text-3xl font-black text-${card.color}-600`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Red Alert Banner */}
      {kritis > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-800">
              {kritis} item stok KRITIS — Segera lakukan pengadaan atau distribusi ulang!
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Pesanan di POS akan ditolak otomatis jika stok bahan baku habis.
            </p>
          </div>
        </div>
      )}

      {/* Stock Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">Daftar Stok Bahan Baku</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedBranch === 'all' ? 'Semua Cabang (Konsolidasi)' : (branches.find(b => b.id === selectedBranch)?.name ?? selectedBranch)}
              · {filtered.length} item
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Nama Bahan', 'Satuan', 'Stok Saat Ini', 'Stok Min', 'Harga / Unit', selectedBranch === 'all' ? 'Cabang' : '', 'Status'].filter(Boolean).map(h => (
                  <th key={h} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m, i) => (
                <tr key={`${m.id}-${m.branchId}-${i}`} className={`hover:bg-slate-50 transition-colors ${m.stok <= m.stokMin * 0.5 ? 'bg-red-50/30' : ''}`}>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{m.nama}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-sm">{m.satuan}</td>
                  <td className="px-5 py-3.5">
                    <StokBar stok={m.stok} stokMin={m.stokMin} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-sm">{m.stokMin} {m.satuan}</td>
                  <td className="px-5 py-3.5 text-slate-700 text-sm">Rp {m.harga.toLocaleString('id-ID')}</td>
                  {selectedBranch === 'all' && (
                    <td className="px-5 py-3.5 text-slate-500 text-sm">{m.branchName}</td>
                  )}
                  <td className="px-5 py-3.5">
                    <StokBadge stok={m.stok} stokMin={m.stokMin} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal: Tambah Bahan Baku
// ─────────────────────────────────────────────────────────────────────────────

const SATUAN_OPTIONS = ['Kg', 'Gram', 'Liter', 'mL', 'Kotak', 'Pcs', 'Lusin', 'Karung', 'Botol', 'Sachet'];

interface NewMaterialForm {
  nama: string;
  satuan: string;
  satuanCustom: string;
  stok: string;
  stokMin: string;
  harga: string;
}

function AddMaterialModal({
  onClose,
  onSave,
  nextId,
}: {
  onClose: () => void;
  onSave: (entry: StockEntry) => void;
  nextId: string;
}) {
  const [form, setForm] = useState<NewMaterialForm>({
    nama: '', satuan: 'Kg', satuanCustom: '', stok: '', stokMin: '', harga: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof NewMaterialForm, string>>>({});

  const satuanFinal = form.satuan === '__custom__' ? form.satuanCustom.trim() : form.satuan;

  const set = (field: keyof NewMaterialForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.nama.trim())        errs.nama     = 'Nama bahan wajib diisi';
    if (!satuanFinal)             errs.satuan   = 'Satuan wajib diisi';
    if (!form.stok.trim() || isNaN(Number(form.stok)))    errs.stok    = 'Stok awal tidak valid';
    if (!form.stokMin.trim() || isNaN(Number(form.stokMin))) errs.stokMin = 'Stok minimum tidak valid';
    if (!form.harga.trim() || isNaN(Number(form.harga))) errs.harga   = 'Harga tidak valid';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id: nextId,
      nama: form.nama.trim(),
      satuan: satuanFinal,
      stok: parseFloat(form.stok),
      stokMin: parseFloat(form.stokMin),
      harga: parseInt(form.harga),
      branchId: 'CBG-001',
      branchName: 'Malang Pusat',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Tambah Bahan Baku</h2>
            <p className="text-xs text-slate-500 mt-0.5">Input data bahan baku secara manual</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* ID Preview */}
        <div className="mx-6 mt-4 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID Otomatis</span>
          <span className="font-mono font-bold text-indigo-600 text-sm">{nextId}</span>
        </div>

        {/* Form Fields */}
        <div className="px-6 py-4 space-y-4">
          {/* Nama */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Nama Bahan <span className="text-red-500">*</span>
            </label>
            <input
              value={form.nama}
              onChange={set('nama')}
              placeholder="cth. Beras Pandan, Ayam Fillet..."
              className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 ${
                errors.nama ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-400'
              }`}
            />
            {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama}</p>}
          </div>

          {/* Satuan */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Satuan <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={form.satuan}
                onChange={set('satuan')}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 transition-all"
              >
                {SATUAN_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="__custom__">Lainnya (ketik sendiri)</option>
              </select>
              {form.satuan === '__custom__' && (
                <input
                  value={form.satuanCustom}
                  onChange={set('satuanCustom')}
                  placeholder="Satuan..."
                  className={`w-36 bg-white border rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 ${
                    errors.satuan ? 'border-red-400' : 'border-slate-200 focus:border-indigo-400'
                  }`}
                />
              )}
            </div>
            {errors.satuan && <p className="text-xs text-red-500 mt-1">{errors.satuan}</p>}
          </div>

          {/* Stok + Stok Min */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Stok Awal <span className="text-red-500">*</span>
                {satuanFinal && <span className="ml-1 text-slate-400 normal-case font-normal">({satuanFinal})</span>}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.stok}
                onChange={set('stok')}
                placeholder="0"
                className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 ${
                  errors.stok ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-400'
                }`}
              />
              {errors.stok && <p className="text-xs text-red-500 mt-1">{errors.stok}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Stok Minimum <span className="text-red-500">*</span>
                {satuanFinal && <span className="ml-1 text-slate-400 normal-case font-normal">({satuanFinal})</span>}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.stokMin}
                onChange={set('stokMin')}
                placeholder="0"
                className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 ${
                  errors.stokMin ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-400'
                }`}
              />
              {errors.stokMin && <p className="text-xs text-red-500 mt-1">{errors.stokMin}</p>}
            </div>
          </div>

          {/* Harga */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Harga / Unit (Rp) <span className="text-red-500">*</span>
              {satuanFinal && <span className="ml-1 text-slate-400 normal-case font-normal">per {satuanFinal}</span>}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">Rp</span>
              <input
                type="number"
                min="0"
                value={form.harga}
                onChange={set('harga')}
                placeholder="0"
                className={`w-full bg-white border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 ${
                  errors.harga ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-400'
                }`}
              />
            </div>
            {errors.harga && <p className="text-xs text-red-500 mt-1">{errors.harga}</p>}
            {form.harga && !isNaN(Number(form.harga)) && Number(form.harga) > 0 && (
              <p className="text-xs text-indigo-500 mt-1">
                = Rp {parseInt(form.harga).toLocaleString('id-ID')} / {satuanFinal || 'unit'}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm shadow-indigo-200 active:scale-95 transition-all"
          >
            <Plus size={15} /> Simpan Bahan Baku
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Bahan Baku
// ─────────────────────────────────────────────────────────────────────────────

function BahanBakuTab({
  customMaterials,
  onAddMaterial,
}: {
  customMaterials: StockEntry[];
  onAddMaterial: (entry: StockEntry) => void;
}) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const hqStock = [...getBranchStock('CBG-001').map(item => ({
    id: item.materialId,
    nama: item.materialName,
    satuan: item.satuan,
    stok: item.stok,
    stokMin: item.stokMin,
    harga: item.harga,
    branchId: 'CBG-001',
    branchName: 'Malang Pusat',
  })), ...customMaterials];
  const lowCount = hqStock.filter(m => m.stok <= m.stokMin).length;
  const filtered = hqStock.filter(m =>
    m.nama.toLowerCase().includes(search.toLowerCase())
  );

  const nextId = `BHN-${String(rawMaterialOptions.length + customMaterials.length + 1).padStart(3, '0')}`;

  return (
    <div className="space-y-4">
      {showModal && (
        <AddMaterialModal
          nextId={nextId}
          onClose={() => setShowModal(false)}
          onSave={entry => { onAddMaterial(entry); setShowModal(false); }}
        />
      )}

      {lowCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <p className="text-sm font-semibold text-amber-800">
            {lowCount} bahan baku perlu restock segera. Periksa kolom Status di bawah ini.
          </p>
        </div>
      )}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800">Daftar Bahan Baku</h3>
            <p className="text-xs text-slate-500 mt-0.5">{hqStock.length} item terdaftar</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari bahan..."
                className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 transition-all w-52 placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-200 active:scale-95 transition-all"
            >
              <Plus size={15} /> Tambah Bahan Baku
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['ID', 'Nama Bahan', 'Satuan', 'Stok Saat Ini', 'Stok Min', 'Harga / Unit', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m, i) => (
                <tr key={`${m.id}-${i}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{m.id}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{m.nama}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-sm">{m.satuan}</td>
                  <td className={`px-5 py-3.5 font-bold text-sm ${m.stok <= m.stokMin ? 'text-red-600' : 'text-slate-800'}`}>
                    {m.stok} {m.satuan}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-sm">{m.stokMin} {m.satuan}</td>
                  <td className="px-5 py-3.5 text-slate-700 text-sm">Rp {m.harga.toLocaleString('id-ID')}</td>
                  <td className="px-5 py-3.5">
                    <StokBadge stok={m.stok} stokMin={m.stokMin} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                    Tidak ada bahan baku yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: BOM (existing, refactored)
// ─────────────────────────────────────────────────────────────────────────────

function BOMTab() {
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const allStock: StockEntry[] = getBranchStock('CBG-001').map(item => ({
    id: item.materialId,
    nama: item.materialName,
    satuan: item.satuan,
    stok: item.stok,
    stokMin: item.stokMin,
    harga: item.harga,
    branchId: 'CBG-001',
    branchName: 'Malang Pusat',
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Info size={17} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          <strong>Auto Stock Deduction:</strong> Setiap penjualan di POS akan memotong stok bahan baku
          secara otomatis sesuai resep. Jika stok tidak mencukupi, pesanan akan <strong>ditolak otomatis</strong>.
        </p>
      </div>
      <div className="space-y-3">
        {recipes.map(recipe => (
          <div key={recipe.id} className="glass-card overflow-hidden">
            <button
              onClick={() => setExpandedRecipe(expandedRecipe === recipe.id ? null : recipe.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <BookOpen size={17} className="text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">{recipe.namaProduk}</p>
                  <p className="text-xs text-slate-500">{recipe.kategori} · {recipe.bahan.length} bahan baku</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide">HPP / Porsi</p>
                  <p className="font-black text-indigo-600 text-base">Rp {recipe.hppPerPorsi.toLocaleString('id-ID')}</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-full">
                  Aktif
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${expandedRecipe === recipe.id ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {expandedRecipe === recipe.id && (
              <div className="border-t border-slate-100">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bahan Baku</th>
                      <th className="px-6 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Qty / Porsi</th>
                      <th className="px-6 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Satuan</th>
                      <th className="px-6 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Est. Biaya</th>
                      <th className="px-6 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stok (Pusat)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recipe.bahan.map(b => {
                      const material = allStock.find(m => m.id === b.idBahan);
                      const cost = material ? material.harga * b.qtyPerPorsi : 0;
                      return (
                        <tr key={b.idBahan} className="hover:bg-slate-50">
                          <td className="px-6 py-3 text-sm font-medium text-slate-700">{b.namaBahan}</td>
                          <td className="px-6 py-3 text-sm font-bold text-slate-800">{b.qtyPerPorsi}</td>
                          <td className="px-6 py-3 text-sm text-slate-500">{b.satuan}</td>
                          <td className="px-6 py-3 text-sm font-semibold text-indigo-600">
                            Rp {cost.toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-3">
                            {material ? (
                              <StokBadge stok={material.stok} stokMin={material.stokMin} />
                            ) : (
                              <span className="text-xs text-slate-400">–</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-indigo-100 bg-indigo-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-sm font-bold text-slate-700 text-right">
                        Total HPP / Porsi:
                      </td>
                      <td className="px-6 py-3 text-base font-black text-indigo-700">
                        Rp {recipe.hppPerPorsi.toLocaleString('id-ID')}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        ))}
        <button className="w-full py-4 glass-card flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 hover:border-indigo-200 border-dashed transition-all">
          <Plus size={16} /> Tambah Resep Produk Baru
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Pengadaan (Belanja Bahan Baku)
// ─────────────────────────────────────────────────────────────────────────────

let lineKeyCounter = 10;

function PengadaanTab({ customMaterials }: { customMaterials: StockEntry[] }) {
  const [supplier, setSupplier] = useState('');
  const [targetBranch, setTargetBranch] = useState('CBG-001');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<PurchaseLine[]>([
    { key: 1, productId: '', productName: '', qty: '', totalAmount: '', unitPrice: '' },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [lastPO, setLastPO] = useState('');
  const [savedPrices, setSavedPrices] = useState<{ name: string; unitPrice: number; unit: string }[]>([]);

  const addLine = () => {
    setLines(prev => [...prev, { key: ++lineKeyCounter, productId: '', productName: '', qty: '', totalAmount: '', unitPrice: '' }]);
  };

  const removeLine = (key: number) => {
    setLines(prev => prev.filter(l => l.key !== key));
  };

  // Auto-hitung unitPrice = totalAmount / qty setiap kali qty atau totalAmount berubah
  const updateLine = (key: number, field: 'productId' | 'qty' | 'totalAmount', value: string) => {
    setLines(prev => prev.map(l => {
      if (l.key !== key) return l;
      if (field === 'productId') {
        const mat    = rawMaterialOptions.find(m => m.id === value);
        const custom = customMaterials.find(m => m.id === value);
        const currentPrices = getMaterialPrices();
        const saved = currentPrices[value];
        const name  = mat?.name ?? custom?.nama ?? '';
        const price = saved ? String(saved.pricePerUnit) : (mat ? String(mat.purchasePrice) : custom ? String(custom.harga) : '');
        return { ...l, productId: value, productName: name, unitPrice: price };
      }
      const updated = { ...l, [field]: value };
      // Recalc unitPrice
      const qty   = parseFloat(field === 'qty' ? value : updated.qty) || 0;
      const total = parseFloat(field === 'totalAmount' ? value : updated.totalAmount) || 0;
      updated.unitPrice = qty > 0 && total > 0 ? String(Math.round(total / qty)) : updated.unitPrice;
      return updated;
    }));
  };

  const grandTotal = lines.reduce((sum, l) => sum + (parseFloat(l.totalAmount) || 0), 0);

  const handleSubmit = () => {
    const poNum = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    // Simpan harga bahan baku terbaru ke localStorage
    const updated: { name: string; unitPrice: number; unit: string }[] = [];
    lines.forEach(l => {
      if (!l.productId || !l.unitPrice) return;
      const mat    = rawMaterialOptions.find(m => m.id === l.productId);
      const custom = customMaterials.find(m => m.id === l.productId);
      const unit   = mat?.unit ?? custom?.satuan ?? 'unit';
      const price  = parseFloat(l.unitPrice) || 0;
      const qty    = parseFloat(l.qty) || 0;
      if (price > 0) {
        saveMaterialPrice(l.productId, {
          name: l.productName,
          pricePerUnit: price,
          unit,
          updatedAt: new Date().toISOString().slice(0, 10),
        });
        updated.push({ name: l.productName, unitPrice: price, unit });
      }
      // Update branch stock
      if (qty > 0) {
        const currentStock = getBranchStock(targetBranch);
        const existingIdx = currentStock.findIndex(s => s.materialId === l.productId);
        if (existingIdx >= 0) {
          currentStock[existingIdx] = { ...currentStock[existingIdx], stok: currentStock[existingIdx].stok + qty, harga: price > 0 ? price : currentStock[existingIdx].harga };
        } else {
          const name = l.productName || mat?.name || custom?.nama || l.productId;
          currentStock.push({ materialId: l.productId, materialName: name, satuan: unit, stok: qty, stokMin: 0, harga: price });
        }
        saveBranchStock(targetBranch, currentStock);
      }
    });
    setSavedPrices(updated);
    setLastPO(poNum);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSupplier(''); setTargetBranch('CBG-001'); setNotes('');
    setLines([{ key: ++lineKeyCounter, productId: '', productName: '', qty: '', totalAmount: '', unitPrice: '' }]);
    setSubmitted(false); setSavedPrices([]);
  };

  if (submitted) {
    return (
      <div className="glass-card p-10 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Pengadaan Berhasil!</h3>
          <p className="text-slate-500 mt-1">Nomor PO: <span className="font-mono font-bold text-indigo-600">{lastPO}</span></p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 w-full max-w-md text-sm text-left space-y-2">
          <p className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Jurnal Otomatis Tercatat</p>
          <div className="flex justify-between text-slate-600">
            <span>Dr. 1401 Persediaan Bahan Baku</span>
            <span className="font-bold">Rp {grandTotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="pl-4">Cr. 1101 Kas</span>
            <span className="font-bold">Rp {grandTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>
        {savedPrices.length > 0 && (
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 w-full max-w-md text-sm text-left space-y-1.5">
            <p className="font-bold text-indigo-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calculator size={12} /> Harga Bahan Baku Diperbarui
            </p>
            {savedPrices.map((sp, i) => (
              <div key={i} className="flex justify-between text-indigo-700">
                <span>{sp.name}</span>
                <span className="font-bold">Rp {sp.unitPrice.toLocaleString('id-ID')} / {sp.unit}</span>
              </div>
            ))}
            <p className="text-[11px] text-indigo-500 mt-1">HPP produk akan otomatis diperbarui di halaman Produk → Recalc HPP</p>
          </div>
        )}
        <button onClick={handleReset} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all">
          Buat Pengadaan Baru
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
        <ShoppingCart size={17} className="text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-800">
          <strong>Otomatis:</strong> Setiap pengadaan akan menambah stok di cabang tujuan dan mencatat
          jurnal <strong>Debit Persediaan / Kredit Kas</strong> di Laporan Keuangan.
        </p>
      </div>

      {/* Header Form */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <ShoppingCart size={17} className="text-indigo-600" /> Detail Pengadaan
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Supplier</label>
            <select
              value={supplier}
              onChange={e => setSupplier(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 transition-all"
            >
              <option value="">-- Pilih Supplier --</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cabang Tujuan</label>
            <select
              value={targetBranch}
              onChange={e => setTargetBranch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 transition-all"
            >
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Catatan</label>
            <input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Opsional..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Item Pengadaan</h3>
          <button
            onClick={addLine}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all"
          >
            <Plus size={13} /> Tambah Item
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Bahan Baku', 'Qty', 'Satuan', 'Total Bayar (Rp)', 'Harga / Unit (Auto)', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map(line => {
                const mat    = rawMaterialOptions.find(m => m.id === line.productId);
                const custom = customMaterials.find(m => m.id === line.productId);
                const unit   = mat?.unit ?? custom?.satuan;
                const unitPrice = parseFloat(line.unitPrice) || 0;
                const qty = parseFloat(line.qty) || 0;
                return (
                  <tr key={line.key} className="hover:bg-slate-50">
                    <td className="px-5 py-3 w-52">
                      <select
                        value={line.productId}
                        onChange={e => updateLine(line.key, 'productId', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
                      >
                        <option value="">-- Pilih Bahan --</option>
                        {rawMaterialOptions.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        {customMaterials.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3 w-28">
                      <input
                        type="number" min="0"
                        value={line.qty}
                        onChange={e => updateLine(line.key, 'qty', e.target.value)}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
                      />
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500 font-medium">{unit ?? '–'}</td>
                    <td className="px-5 py-3 w-40">
                      <input
                        type="number" min="0"
                        value={line.totalAmount}
                        onChange={e => updateLine(line.key, 'totalAmount', e.target.value)}
                        placeholder="150000"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
                      />
                    </td>
                    <td className="px-5 py-3">
                      {unitPrice > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <Calculator size={12} className="text-indigo-500" />
                          <span className="font-bold text-indigo-700">Rp {unitPrice.toLocaleString('id-ID')}</span>
                          <span className="text-xs text-slate-400">/{unit ?? 'unit'}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Isi qty &amp; total</span>
                      )}
                      {qty > 0 && parseFloat(line.totalAmount) > 0 && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {parseFloat(line.totalAmount).toLocaleString('id-ID')} ÷ {qty} {unit} = {unitPrice.toLocaleString('id-ID')}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {lines.length > 1 && (
                        <button onClick={() => removeLine(line.key)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td colSpan={3} className="px-5 py-3.5 text-sm font-bold text-slate-700 text-right">Grand Total Pembelian:</td>
                <td className="px-5 py-3.5 text-lg font-black text-indigo-700">Rp {grandTotal.toLocaleString('id-ID')}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Finance Impact Preview */}
      {grandTotal > 0 && (
        <div className="glass-card p-5 border-l-4 border-indigo-400">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Preview Jurnal Otomatis</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-700"><span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded mr-2">Dr</span>1401 Persediaan Bahan Baku</span>
              <span className="font-bold text-slate-800">Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center pl-6">
              <span className="text-slate-700"><span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded mr-2">Cr</span>1101 Kas</span>
              <span className="font-bold text-slate-800">Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Harga bahan baku per unit akan diperbarui otomatis → HPP produk ikut berubah.</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleReset}
          className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all"
        >
          Reset
        </button>
        <button
          onClick={handleSubmit}
          disabled={!lines.some(l => l.productId && parseFloat(l.qty) > 0 && parseFloat(l.totalAmount) > 0)}
          className="flex items-center gap-2 px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm shadow-sm shadow-indigo-200 active:scale-95 transition-all"
        >
          <ShoppingCart size={16} /> Simpan & Proses Pengadaan
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Distribusi (Kirim Stok ke Cabang)
// ─────────────────────────────────────────────────────────────────────────────

function DistribusiTab() {
  const [fromBranch] = useState('CBG-001');
  const [toBranch, setToBranch] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<TransferLine[]>([
    { key: 1, productId: '', productName: '', availableQty: 0, qty: '' },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [lastSTR, setLastSTR] = useState('');

  const hqStock: StockEntry[] = getBranchStock('CBG-001').map(item => ({
    id: item.materialId,
    nama: item.materialName,
    satuan: item.satuan,
    stok: item.stok,
    stokMin: item.stokMin,
    harga: item.harga,
    branchId: 'CBG-001',
    branchName: 'Malang Pusat',
  }));

  const addLine = () => {
    setLines(prev => [...prev, { key: ++lineKeyCounter, productId: '', productName: '', availableQty: 0, qty: '' }]);
  };

  const removeLine = (key: number) => {
    setLines(prev => prev.filter(l => l.key !== key));
  };

  const updateLine = (key: number, field: 'productId' | 'qty', value: string) => {
    setLines(prev => prev.map(l => {
      if (l.key !== key) return l;
      if (field === 'productId') {
        const stock = hqStock.find(s => s.id === value);
        return { ...l, productId: value, productName: stock?.nama ?? '', availableQty: stock?.stok ?? 0 };
      }
      return { ...l, qty: value };
    }));
  };

  const hasError = lines.some(l => {
    const qty = parseFloat(l.qty) || 0;
    return l.productId && qty > l.availableQty;
  });

  const handleSubmit = () => {
    if (hasError) return;
    const strNum = `STR-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    // Deduct from source (CBG-001) and add to target branch
    const srcStock = getBranchStock('CBG-001');
    const dstStock = getBranchStock(toBranch);
    lines.forEach(l => {
      const qty = parseFloat(l.qty) || 0;
      if (!l.productId || qty <= 0) return;
      // Reduce source
      const srcIdx = srcStock.findIndex(s => s.materialId === l.productId);
      if (srcIdx >= 0) srcStock[srcIdx] = { ...srcStock[srcIdx], stok: Math.max(0, srcStock[srcIdx].stok - qty) };
      // Add to destination
      const dstIdx = dstStock.findIndex(s => s.materialId === l.productId);
      if (dstIdx >= 0) {
        dstStock[dstIdx] = { ...dstStock[dstIdx], stok: dstStock[dstIdx].stok + qty };
      } else {
        const srcItem = srcStock.find(s => s.materialId === l.productId);
        dstStock.push({ materialId: l.productId, materialName: l.productName, satuan: srcItem?.satuan ?? 'unit', stok: qty, stokMin: 0, harga: srcItem?.harga ?? 0 });
      }
    });
    saveBranchStock('CBG-001', srcStock);
    saveBranchStock(toBranch, dstStock);
    setLastSTR(strNum);
    setSubmitted(true);
  };

  const handleReset = () => {
    setToBranch('');
    setNotes('');
    setLines([{ key: ++lineKeyCounter, productId: '', productName: '', availableQty: 0, qty: '' }]);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="glass-card p-10 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
          <Truck size={32} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Transfer Berhasil!</h3>
          <p className="text-slate-500 mt-1">Nomor Transfer: <span className="font-mono font-bold text-indigo-600">{lastSTR}</span></p>
        </div>
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <span className="px-3 py-1.5 bg-slate-100 rounded-lg">{branches.find(b => b.id === fromBranch)?.name}</span>
          <ArrowRight size={16} className="text-indigo-500" />
          <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700">
            {branches.find(b => b.id === toBranch)?.name}
          </span>
        </div>
        <button
          onClick={handleReset}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all"
        >
          Buat Transfer Baru
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <Send size={17} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Otomatis:</strong> Transfer akan mengurangi stok di Pusat dan menambah stok di Cabang tujuan secara real-time.
        </p>
      </div>

      {/* Header Form */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Send size={17} className="text-indigo-600" /> Rute Transfer
        </h3>
        <div className="flex items-center gap-4">
          {/* From */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dari Cabang</label>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <Warehouse size={15} className="text-indigo-500" />
              <span className="text-sm font-semibold text-slate-700">
                {branches.find(b => b.id === fromBranch)?.name}
              </span>
              <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">Utama</span>
            </div>
          </div>
          <ArrowRight size={20} className="text-indigo-400 mt-4 shrink-0" />
          {/* To */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ke Cabang</label>
            <select
              value={toBranch}
              onChange={e => setToBranch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 transition-all"
            >
              <option value="">-- Pilih Cabang Tujuan --</option>
              {branches.filter(b => b.id !== fromBranch).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Catatan</label>
            <input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Opsional..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Bahan Baku yang Dikirim</h3>
          <button
            onClick={addLine}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all"
          >
            <Plus size={13} /> Tambah Item
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Bahan Baku', 'Stok Tersedia (Pusat)', 'Qty Kirim', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map(line => {
                const qty = parseFloat(line.qty) || 0;
                const insufficient = line.productId && qty > line.availableQty;
                return (
                  <tr key={line.key} className={`hover:bg-slate-50 ${insufficient ? 'bg-red-50/40' : ''}`}>
                    <td className="px-5 py-3 w-56">
                      <select
                        value={line.productId}
                        onChange={e => updateLine(line.key, 'productId', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
                      >
                        <option value="">-- Pilih Bahan --</option>
                        {hqStock.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-slate-700">
                      {line.productId ? (
                        <span className={line.availableQty <= 0 ? 'text-red-600' : 'text-emerald-700'}>
                          {line.availableQty} {hqStock.find(s => s.id === line.productId)?.satuan}
                        </span>
                      ) : '–'}
                    </td>
                    <td className="px-5 py-3 w-32">
                      <input
                        type="number"
                        min="0"
                        max={line.availableQty}
                        value={line.qty}
                        onChange={e => updateLine(line.key, 'qty', e.target.value)}
                        placeholder="0"
                        className={`w-full bg-white border rounded-lg px-3 py-2 text-sm text-slate-700 outline-none transition-all ${
                          insufficient ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-400'
                        }`}
                      />
                    </td>
                    <td className="px-5 py-3">
                      {insufficient ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold rounded-full">
                          <AlertTriangle size={10} /> Stok Tidak Cukup
                        </span>
                      ) : line.productId && qty > 0 ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-full">
                          <CheckCircle size={10} /> OK
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      {lines.length > 1 && (
                        <button
                          onClick={() => removeLine(line.key)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleReset}
          className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all"
        >
          Reset
        </button>
        <button
          onClick={handleSubmit}
          disabled={!toBranch || hasError || !lines.some(l => l.productId && parseFloat(l.qty) > 0)}
          className="flex items-center gap-2 px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm shadow-sm shadow-indigo-200 active:scale-95 transition-all"
        >
          <Send size={16} /> Kirim Stok ke Cabang
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Inventory() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [customMaterials, setCustomMaterials] = useState<StockEntry[]>([]);

  const allHqStock: StockEntry[] = [...getBranchStock('CBG-001').map(item => ({
    id: item.materialId,
    nama: item.materialName,
    satuan: item.satuan,
    stok: item.stok,
    stokMin: item.stokMin,
    harga: item.harga,
    branchId: 'CBG-001',
    branchName: 'Malang Pusat',
  })), ...customMaterials];
  const alertCount = allHqStock.filter(s => s.stok <= s.stokMin * 0.5).length;

  return (
    <div className="space-y-5">
      {/* Header Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <TabBtn active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>
          <BarChart3 size={15} /> Dashboard Stok
        </TabBtn>
        <TabBtn active={tab === 'bahan'} onClick={() => setTab('bahan')}>
          <Package size={15} /> Bahan Baku
        </TabBtn>
        <TabBtn active={tab === 'bom'} onClick={() => setTab('bom')}>
          <BookOpen size={15} /> Resep / BOM
        </TabBtn>
        <TabBtn active={tab === 'pengadaan'} onClick={() => setTab('pengadaan')}>
          <ShoppingCart size={15} /> Pengadaan
        </TabBtn>
        <TabBtn active={tab === 'distribusi'} onClick={() => setTab('distribusi')}>
          <Send size={15} /> Distribusi
        </TabBtn>

        {/* Red Alert badge */}
        {alertCount > 0 && (
          <span className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-full">
            <AlertTriangle size={12} />
            {alertCount} item kritis!
          </span>
        )}
      </div>

      {/* Tab Content */}
      {tab === 'dashboard' && <DashboardTab />}
      {tab === 'bahan' && (
        <BahanBakuTab
          customMaterials={customMaterials}
          onAddMaterial={entry => setCustomMaterials(prev => [...prev, entry])}
        />
      )}
      {tab === 'bom' && <BOMTab />}
      {tab === 'pengadaan' && <PengadaanTab customMaterials={customMaterials} />}
      {tab === 'distribusi' && <DistribusiTab />}
    </div>
  );
}

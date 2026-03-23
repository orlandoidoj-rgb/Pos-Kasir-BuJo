import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Store, Users, TrendingUp, MapPin, Plus, Phone, Edit2, X,
  Building2, CreditCard, ChevronRight, AlertTriangle, Package,
  RotateCcw, Receipt, CalendarDays, ArrowUpRight, Warehouse, CheckCircle,
  ShoppingBag,
} from 'lucide-react';
import {
  getTransactions, getBranches, saveBranches, getProducts, saveProduct, getBranchStock, getPOSSessions,
} from '../lib/storage';
import type { POSTransaction, Branch, MasterProduct, BranchStockItem, POSSession } from '../lib/storage';

// ─────────────────────────────────────────────────────────────────────────────
// Shared data — mirrors Users.tsx roles
// ─────────────────────────────────────────────────────────────────────────────

interface BranchUser {
  id: string;
  nama: string;
  role: 'admin' | 'kasir';
  status: 'active' | 'inactive';
  avatar: string;
  lastLogin: string;
}

const BRANCH_USERS: Record<string, BranchUser[]> = {
  'CBG-001': [
    { id: 'USR-002', nama: 'Budi Santoso',   role: 'admin', status: 'active',   avatar: 'BS', lastLogin: '2026-03-19 09:15' },
    { id: 'USR-004', nama: 'Ahmad Kasir',     role: 'kasir', status: 'active',   avatar: 'AH', lastLogin: '2026-03-19 10:00' },
    { id: 'USR-005', nama: 'Dewi Kasir',      role: 'kasir', status: 'active',   avatar: 'DW', lastLogin: '2026-03-19 10:05' },
    { id: 'USR-008', nama: 'Lina (Nonaktif)', role: 'kasir', status: 'inactive', avatar: 'LN', lastLogin: '2026-02-15 09:00' },
  ],
  'CBG-002': [
    { id: 'USR-003', nama: 'Siti Rahayu', role: 'admin', status: 'active', avatar: 'SR', lastLogin: '2026-03-18 17:00' },
    { id: 'USR-006', nama: 'Roni Kasir',  role: 'kasir', status: 'active', avatar: 'RN', lastLogin: '2026-03-18 22:30' },
  ],
  'CBG-003': [
    { id: 'USR-007', nama: 'Agus Kurniawan', role: 'admin', status: 'active', avatar: 'AK', lastLogin: '2026-03-17 14:20' },
  ],
  'CBG-004': [],
};

// Fallback pendapatan mock untuk tiap cabang (dipakai jika belum ada data real POS)
const MOCK_PENDAPATAN: Record<string, number> = {
  'CBG-001': 5200000,
  'CBG-002': 3800000,
  'CBG-003': 4100000,
  'CBG-004': 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BranchFormState {
  nama: string; alamat: string; kota: string;
  manager: string; telp: string; status: 'active' | 'inactive';
}

const EMPTY_FORM: BranchFormState = {
  nama: '', alamat: '', kota: '', manager: '', telp: '', status: 'active',
};

// ─────────────────────────────────────────────────────────────────────────────
// Modal Tambah / Edit Cabang
// ─────────────────────────────────────────────────────────────────────────────

function BranchModal({
  initial, onSave, onClose,
}: {
  initial: Branch | null;
  onSave: (data: BranchFormState) => void;
  onClose: () => void;
}) {
  const isEdit = initial !== null;
  const [form, setForm] = useState<BranchFormState>(
    initial
      ? { nama: initial.nama, alamat: initial.alamat, kota: initial.kota, manager: initial.manager, telp: initial.telp, status: initial.status }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState<Partial<BranchFormState>>({});
  const set = (k: keyof BranchFormState, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    const e: Partial<BranchFormState> = {};
    if (!form.nama.trim()) e.nama = 'Nama cabang wajib diisi';
    if (!form.kota.trim()) e.kota = 'Kota wajib diisi';
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[520px] border border-slate-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Store size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">{isEdit ? 'Edit Cabang' : 'Tambah Cabang Baru'}</h2>
              {isEdit && <p className="text-xs text-slate-400 font-mono">{initial.id}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Cabang *</label>
            <input autoFocus value={form.nama} onChange={e => set('nama', e.target.value)} placeholder="Contoh: Malang Dieng"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 ${errors.nama ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-indigo-400'}`} />
            {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kota *</label>
              <input value={form.kota} onChange={e => set('kota', e.target.value)} placeholder="Malang"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 ${errors.kota ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-indigo-400'}`} />
              {errors.kota && <p className="text-xs text-red-500 mt-1">{errors.kota}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">No. Telepon</label>
              <div className="relative">
                <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={form.telp} onChange={e => set('telp', e.target.value)} placeholder="0341-xxxxxx"
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 transition-all placeholder:text-slate-400" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Alamat Lengkap</label>
            <input value={form.alamat} onChange={e => set('alamat', e.target.value)} placeholder="Jl. Contoh No. 1"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 transition-all placeholder:text-slate-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Manager</label>
            <input value={form.manager} onChange={e => set('manager', e.target.value)} placeholder="Nama penanggung jawab"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 transition-all placeholder:text-slate-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status Cabang</label>
            <div className="flex gap-3">
              {(['active', 'inactive'] as const).map(s => (
                <button key={s} onClick={() => set('status', s)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    form.status === s
                      ? s === 'active' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-600 text-white border-slate-600'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}>
                  {s === 'active' ? 'Aktif' : 'Nonaktif'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all">Batal</button>
          <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm shadow-indigo-200 active:scale-95 transition-all">
            {isEdit ? 'Simpan Perubahan' : 'Tambah Cabang'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Flip Panel — Stock view
// ─────────────────────────────────────────────────────────────────────────────

function StockPanel({ branchId }: { branchId: string }) {
  const items: BranchStockItem[] = getBranchStock(branchId);
  if (items.length === 0) return (
    <div className="py-8 text-center text-slate-400 text-sm">
      <Warehouse size={28} className="mx-auto mb-2 opacity-30" />
      Belum ada data stok
    </div>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {['Bahan Baku', 'Stok', 'Min', 'Status'].map(h => (
              <th key={h} className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map(item => {
            const isKritis  = item.stok <= item.stokMin * 0.5;
            const isLow     = item.stok <= item.stokMin && !isKritis;
            const pct       = Math.min((item.stok / (item.stokMin * 3)) * 100, 100);
            const barColor  = isKritis ? 'bg-red-500' : isLow ? 'bg-amber-400' : 'bg-emerald-500';
            return (
              <tr key={item.materialId} className={`transition-colors ${isKritis ? 'bg-red-50/40' : 'hover:bg-slate-50'}`}>
                <td className="px-4 py-2.5 text-sm font-medium text-slate-700">{item.materialName}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-sm font-bold ${isKritis || isLow ? 'text-red-600' : 'text-slate-800'}`}>
                      {item.stok}
                    </span>
                    <span className="text-xs text-slate-400">{item.satuan}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-400">{item.stokMin} {item.satuan}</td>
                <td className="px-4 py-2.5">
                  {isKritis ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded-full">
                      <AlertTriangle size={9} /> Kritis
                    </span>
                  ) : isLow ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold rounded-full">
                      <AlertTriangle size={9} /> Low
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                      <CheckCircle size={9} /> Aman
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Flip Panel — Transaction log view
// ─────────────────────────────────────────────────────────────────────────────

function TransactionPanel({ branchId, isOwnerPrimary, allTx }: { branchId: string; isOwnerPrimary: boolean; allTx: POSTransaction[] }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Filter transactions by branchId; fallback: show all for the owner-primary branch
  const branchTx = useMemo(() => {
    const filtered = allTx.filter(tx => tx.branchId === branchId);
    if (filtered.length > 0) return filtered;
    // Fallback: old transactions without branchId are shown on the primary branch
    if (isOwnerPrimary) return allTx.filter(tx => !tx.branchId || tx.branchId === branchId);
    return [];
  }, [allTx, branchId, isOwnerPrimary]);

  const dayTx = useMemo(() =>
    branchTx.filter(tx => tx.date.startsWith(selectedDate)),
    [branchTx, selectedDate]
  );

  const dayRevenue  = dayTx.reduce((s, t) => s + t.total, 0);
  const dayTxCount  = dayTx.length;

  const availableDates = useMemo(() => {
    const dates = new Set(branchTx.map(tx => tx.date.slice(0, 10)));
    return Array.from(dates).sort((a, b) => b.localeCompare(a));
  }, [branchTx]);

  if (branchTx.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-sm">
        <Receipt size={28} className="mx-auto mb-2 opacity-30" />
        Belum ada transaksi POS tercatat
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarDays size={13} className="text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 outline-none focus:border-indigo-400 transition-all"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {availableDates.slice(0, 5).map(d => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                d === selectedDate
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d === todayStr ? 'Hari ini' : new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
            </button>
          ))}
        </div>
        {dayTxCount > 0 && (
          <span className="ml-auto text-xs text-slate-500 font-semibold">
            {dayTxCount} tx · <span className="text-emerald-600">Rp {dayRevenue.toLocaleString('id-ID')}</span>
          </span>
        )}
      </div>

      {dayTx.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-sm">Tidak ada transaksi pada tanggal ini</div>
      ) : (
        <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
          {dayTx.map(tx => {
            const time = new Date(tx.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={tx.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <Receipt size={14} className="text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">{tx.id}</p>
                  <p className="text-[10px] text-slate-400">{time} · {tx.orderType} · {tx.items.length} item</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-800">Rp {tx.total.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-emerald-500 font-semibold">+Rp {tx.grossProfit.toLocaleString('id-ID')}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Flip Panel — Menu Produk view
// ─────────────────────────────────────────────────────────────────────────────

function MenuPanel({ branchId }: { branchId: string }) {
  const [products, setProducts] = useState<MasterProduct[]>(() => getProducts());

  const reload = () => setProducts(getProducts());

  const handleToggle = (product: MasterProduct) => {
    const current = product.branchActivations?.[branchId] ?? false;
    saveProduct({
      ...product,
      branchActivations: { ...product.branchActivations, [branchId]: !current },
    });
    reload();
  };

  const activeCount = products.filter(p => p.branchActivations?.[branchId] === true).length;

  return (
    <div>
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          <span className="font-bold text-indigo-600">{activeCount}</span> produk aktif di cabang ini
        </span>
      </div>
      <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
        {products.map(p => {
          const active = p.branchActivations?.[branchId] === true;
          return (
            <div key={p.id} className="px-4 py-2 flex items-center gap-3 hover:bg-slate-50">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                {p.image
                  ? <img src={p.image} className="w-full h-full object-cover" alt="" onError={e => (e.currentTarget.style.display = 'none')} />
                  : <ShoppingBag size={12} className="text-slate-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{p.name}</p>
                <p className="text-[10px] text-slate-400">Rp {p.prices['Dine-in'].toLocaleString('id-ID')}</p>
              </div>
              <button
                onClick={() => handleToggle(p)}
                className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${active ? 'left-4' : 'left-0.5'}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Branch Card with Flip Panel
// ─────────────────────────────────────────────────────────────────────────────

type PanelFace = 'stok' | 'transaksi' | 'menu';

function BranchCard({
  branch, revenueRaw, kontribusiPct, totalRevenue, allTx, session,
  onEdit,
}: {
  branch: Branch;
  revenueRaw: number;
  kontribusiPct: number;
  totalRevenue: number;
  allTx: POSTransaction[];
  session: POSSession | null;
  onEdit: () => void;
}) {
  const users = BRANCH_USERS[branch.id] ?? [];
  const kasirAktif  = users.filter(u => u.role === 'kasir' && u.status === 'active');
  const stockItems  = getBranchStock(branch.id);
  const kritisCount = stockItems.filter(s => s.stok <= s.stokMin * 0.5).length;

  const [face, setFace] = useState<PanelFace>('stok');
  const [flipping, setFlipping] = useState(false);
  const prevFace = useRef<PanelFace>('stok');

  const toggleFace = (next: PanelFace) => {
    if (next === face || flipping) return;
    setFlipping(true);
    setTimeout(() => {
      prevFace.current = face;
      setFace(next);
    }, 180);
    setTimeout(() => setFlipping(false), 360);
  };

  const isOwnerPrimary = branch.isOwnerPrimary === true;
  // Count transactions for badge
  const branchTxCount = allTx.filter(tx => tx.branchId === branch.id || (isOwnerPrimary && (!tx.branchId || tx.branchId === branch.id))).length;

  return (
    <div className={`glass-card flex flex-col overflow-hidden transition-shadow hover:shadow-md ${branch.status === 'inactive' ? 'opacity-60' : ''}`}>
      {/* Card Header */}
      <div className="p-5 pb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${branch.status === 'active' ? 'bg-indigo-50' : 'bg-slate-100'}`}>
              <Store size={18} className={branch.status === 'active' ? 'text-indigo-600' : 'text-slate-400'} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-800 text-sm">{branch.nama}</p>
                {isOwnerPrimary && (
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded uppercase tracking-wider">Utama</span>
                )}
              </div>
              <p className="text-[10px] font-mono text-slate-400">{branch.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Status POS real-time */}
            {session?.active ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-300 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                Sedang Buka
              </span>
            ) : (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                branch.status === 'active'
                  ? 'bg-slate-100 text-slate-500 border border-slate-200'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}>
                {branch.status === 'active' ? 'Tutup' : 'Nonaktif'}
              </span>
            )}
            <button onClick={onEdit} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-500 text-xs font-semibold rounded-lg transition-all">
              <Edit2 size={10} /> Edit
            </button>
          </div>
        </div>

        {/* Alamat + Telepon */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin size={11} className="text-slate-400 shrink-0" />
            <span className="truncate">{branch.alamat}, {branch.kota}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Phone size={11} className="text-slate-400 shrink-0" />
            {branch.telp}
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {/* Pendapatan */}
          <div className="bg-indigo-50 rounded-xl p-2.5 border border-indigo-100">
            <p className="text-[9px] text-indigo-400 uppercase tracking-wider mb-0.5 font-bold">Pendapatan</p>
            <p className="text-sm font-black text-indigo-700 leading-tight">
              {revenueRaw > 0 ? `Rp ${(revenueRaw / 1000000).toFixed(1)}M` : '—'}
            </p>
            {revenueRaw > 0 && allTx.some(tx => tx.branchId === branch.id) && (
              <p className="text-[9px] text-indigo-400 mt-0.5 flex items-center gap-0.5">
                <ArrowUpRight size={8} /> Real POS
              </p>
            )}
          </div>
          {/* Kasir */}
          <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
            <p className="text-[9px] text-emerald-500 uppercase tracking-wider mb-0.5 font-bold">Kasir</p>
            <p className="text-sm font-black text-emerald-700">{kasirAktif.length}</p>
            <p className="text-[9px] text-emerald-400">aktif</p>
          </div>
          {/* Stok alert */}
          <div className={`rounded-xl p-2.5 border ${kritisCount > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
            <p className={`text-[9px] uppercase tracking-wider mb-0.5 font-bold ${kritisCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>Stok</p>
            <p className={`text-sm font-black ${kritisCount > 0 ? 'text-red-600' : 'text-slate-700'}`}>
              {stockItems.length > 0 ? stockItems.length : '—'}
            </p>
            <p className={`text-[9px] ${kritisCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {kritisCount > 0 ? `${kritisCount} kritis` : 'item'}
            </p>
          </div>
        </div>

        {/* Kontribusi Bar */}
        {revenueRaw > 0 && (
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Kontribusi pendapatan</span>
              <span className="font-bold text-indigo-600">{kontribusiPct.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${kontribusiPct}%` }} />
            </div>
          </div>
        )}

        {/* Info kasir POS aktif */}
        {session?.active && (
          <div className="mt-3 pt-3 border-t border-green-100 bg-green-50/50 -mx-5 px-5 pb-3 rounded-b-xl">
            <p className="text-[9px] font-bold text-green-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              Kasir Aktif — POS Online
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-black">
                {session.cashierName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-green-800">{session.cashierName}</p>
                <p className="text-[9px] text-green-500">
                  Login: {new Date(session.loginAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Kasir list dari User Management */}
        {kasirAktif.length > 0 && !session?.active && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <CreditCard size={9} /> Kasir Terdaftar
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {kasirAktif.map(u => (
                <div key={u.id} title={`${u.nama} · Login: ${u.lastLogin}`}
                  className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="w-5 h-5 rounded-full bg-slate-400 text-white text-[9px] font-bold flex items-center justify-center">
                    {u.avatar}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600">{u.nama.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── FLIP PANEL ─── */}
      <div className="border-t border-slate-100 flex-1 flex flex-col">
        {/* Flip toggle tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => toggleFace('stok')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-all ${
              face === 'stok'
                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Package size={12} /> Stok
          </button>
          <button
            onClick={() => toggleFace('transaksi')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-all ${
              face === 'transaksi'
                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Receipt size={12} /> Transaksi
            {branchTxCount > 0 && (
              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-black rounded-full ml-1">
                {branchTxCount}
              </span>
            )}
          </button>
          <button
            onClick={() => toggleFace('menu')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-all ${
              face === 'menu'
                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag size={12} /> Menu Produk
          </button>
          <button
            onClick={() => {
              const faces: PanelFace[] = ['stok', 'transaksi', 'menu'];
              const next = faces[(faces.indexOf(face) + 1) % faces.length];
              toggleFace(next);
            }}
            title="Flip panel"
            className="px-3 py-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border-l border-slate-100"
          >
            <RotateCcw size={13} className={flipping ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Flip content */}
        <div
          style={{
            transition: 'transform 0.18s ease-in-out, opacity 0.18s',
            transform: flipping ? 'scaleX(0)' : 'scaleX(1)',
            opacity: flipping ? 0 : 1,
          }}
        >
          {face === 'stok' && <StockPanel branchId={branch.id} />}
          {face === 'transaksi' && <TransactionPanel branchId={branch.id} isOwnerPrimary={isOwnerPrimary} allTx={allTx} />}
          {face === 'menu' && <MenuPanel branchId={branch.id} />}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Branch Row (list view)
// ─────────────────────────────────────────────────────────────────────────────

function BranchRow({
  branch, revenueRaw, kontribusiPct, onEdit,
}: {
  branch: Branch;
  revenueRaw: number;
  kontribusiPct: number;
  onEdit: () => void;
}) {
  const users = BRANCH_USERS[branch.id] ?? [];
  const kasirAktif = users.filter(u => u.role === 'kasir' && u.status === 'active').length;
  const stockItems = getBranchStock(branch.id);
  const kritisCount = stockItems.filter(s => s.stok <= s.stokMin * 0.5).length;
  const isOwnerPrimary = branch.isOwnerPrimary === true;

  return (
    <tr className={`hover:bg-slate-50 transition-colors ${branch.status === 'inactive' ? 'opacity-60' : ''}`}>
      <td className="px-5 py-4 text-xs font-mono text-slate-400">{branch.id}</td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-800">{branch.nama}</p>
          {isOwnerPrimary && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded uppercase">Utama</span>}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{branch.kota}</p>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Phone size={11} className="text-slate-400" /> {branch.telp}
        </div>
        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[160px]">{branch.alamat}</p>
      </td>
      <td className="px-5 py-4 text-sm text-slate-600">{branch.manager}</td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <CreditCard size={12} className="text-emerald-500" />
          <span className="text-sm font-bold text-slate-700">{kasirAktif}</span>
          <span className="text-xs text-slate-400">aktif</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-bold text-indigo-700">
          {revenueRaw > 0 ? `Rp ${revenueRaw.toLocaleString('id-ID')}` : '—'}
        </p>
        {revenueRaw > 0 && (
          <div className="mt-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${kontribusiPct}%` }} />
              </div>
              <span className="text-[10px] text-indigo-500 font-bold">{kontribusiPct.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </td>
      <td className="px-5 py-4">
        {kritisCount > 0 ? (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded-full">
            <AlertTriangle size={9} /> {kritisCount} Kritis
          </span>
        ) : stockItems.length > 0 ? (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
            <CheckCircle size={9} /> Aman
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
      <td className="px-5 py-4">
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
          branch.status === 'active'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          {branch.status === 'active' ? 'Aktif' : 'Nonaktif'}
        </span>
      </td>
      <td className="px-5 py-4">
        <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-all">
          <Edit2 size={12} /> Edit
        </button>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Branches() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [branches, setBranches] = useState<Branch[]>(() => getBranches());
  const [modalTarget, setModalTarget] = useState<Branch | null | 'new'>(undefined as any);

  // Real transactions from POS + POS sessions
  const [liveTick, setLiveTick] = useState(0);
  useEffect(() => {
    const refresh = () => setLiveTick(t => t + 1);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('focus', refresh); window.removeEventListener('storage', refresh); };
  }, []);

  const allTxLive   = useMemo(() => getTransactions(),   [liveTick]); // eslint-disable-line
  const posSessions = useMemo(() => getPOSSessions(),     [liveTick]); // eslint-disable-line

  // Pendapatan per cabang: real POS jika ada, fallback mock
  const revenueMap = useMemo(() => {
    const map: Record<string, number> = {};
    branches.forEach(b => {
      const txs = allTxLive.filter(tx =>
        tx.branchId === b.id || (b.isOwnerPrimary && (!tx.branchId || tx.branchId === b.id))
      );
      const realTotal = txs.reduce((s, t) => s + t.total, 0);
      map[b.id] = realTotal > 0 ? realTotal : (MOCK_PENDAPATAN[b.id] ?? 0);
    });
    return map;
  }, [branches, allTxLive]);

  const totalRevenue = useMemo(() =>
    Object.values(revenueMap).reduce((s, v) => s + v, 0),
    [revenueMap]
  );

  const totalCabangAktif = branches.filter(b => b.status === 'active').length;
  const totalCabangBuka  = Object.values(posSessions).filter(s => s.active).length;
  const totalKasir = Object.values(BRANCH_USERS).flat().filter(u => u.role === 'kasir' && u.status === 'active').length;

  const handleSave = (data: BranchFormState) => {
    let updated: Branch[];
    if (modalTarget === 'new') {
      const newId = `CBG-${String(branches.length + 1).padStart(3, '0')}`;
      updated = [...branches, {
        id: newId, nama: data.nama, alamat: data.alamat, kota: data.kota,
        status: data.status, manager: data.manager || '(belum ditentukan)', telp: data.telp || '—',
      }];
    } else if (modalTarget && typeof modalTarget === 'object') {
      updated = branches.map(b =>
        b.id === modalTarget.id
          ? { ...b, nama: data.nama, alamat: data.alamat, kota: data.kota, manager: data.manager || b.manager, telp: data.telp || b.telp, status: data.status }
          : b
      );
    } else {
      updated = branches;
    }
    setBranches(updated);
    saveBranches(updated);
    setModalTarget(undefined as any);
  };

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 bg-white border border-slate-200 rounded-xl p-1">
          {(['grid', 'list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                view === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}>
              {v === 'grid' ? 'Grid + Flip Panel' : 'Tabel Ringkas'}
            </button>
          ))}
        </div>
        <button onClick={() => setModalTarget('new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm shadow-indigo-200 active:scale-95 transition-all">
          <Plus size={16} /> Tambah Cabang
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-3 border-l-4 border-l-indigo-500">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Store size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Cabang Terdaftar</p>
            <p className="text-2xl font-black text-slate-800">{totalCabangAktif}<span className="text-base text-slate-400">/{branches.length}</span></p>
            {totalCabangBuka > 0 && (
              <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                {totalCabangBuka} sedang buka (POS aktif)
              </p>
            )}
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3 border-l-4 border-l-emerald-500">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <CreditCard size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Kasir</p>
            <p className="text-2xl font-black text-slate-800">{totalKasir}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3 border-l-4 border-l-amber-500">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Pendapatan</p>
            <p className="text-xl font-black text-slate-800">
              {totalRevenue > 0 ? `Rp ${(totalRevenue / 1000000).toFixed(1)}M` : '—'}
            </p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3 border-l-4 border-l-sky-500">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
            <Receipt size={18} className="text-sky-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Transaksi POS</p>
            <p className="text-2xl font-black text-slate-800">{allTxLive.length}</p>
            <p className="text-[10px] text-emerald-500 font-semibold">Live dari POS Kasir</p>
          </div>
        </div>
      </div>

      {/* Revenue contribution summary bar */}
      {totalRevenue > 0 && (
        <div className="glass-card p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Kontribusi Pendapatan per Cabang (kumulatif)</p>
          <div className="flex h-5 rounded-full overflow-hidden gap-0.5">
            {branches.filter(b => (revenueMap[b.id] ?? 0) > 0).map((b, i) => {
              const pct = (revenueMap[b.id] / totalRevenue) * 100;
              const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-violet-500'];
              return (
                <div key={b.id}
                  className={`${colors[i % colors.length]} flex items-center justify-center transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                  title={`${b.nama}: ${pct.toFixed(1)}%`}
                >
                  {pct > 8 && <span className="text-[9px] font-black text-white drop-shadow">{pct.toFixed(0)}%</span>}
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2 flex-wrap">
            {branches.filter(b => (revenueMap[b.id] ?? 0) > 0).map((b, i) => {
              const pct = (revenueMap[b.id] / totalRevenue) * 100;
              const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-violet-500'];
              return (
                <div key={b.id} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`} />
                  <span className="text-xs text-slate-600 font-medium">{b.nama}</span>
                  <span className="text-xs font-bold text-slate-800">{pct.toFixed(1)}%</span>
                  <span className="text-xs text-slate-400">· Rp {(revenueMap[b.id] / 1000000).toFixed(1)}M</span>
                  {allTxLive.some(tx => tx.branchId === b.id) && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded font-bold">Real POS</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── GRID VIEW with flip panels ── */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {branches.map(branch => (
            <BranchCard
              key={branch.id}
              branch={branch}
              revenueRaw={revenueMap[branch.id] ?? 0}
              kontribusiPct={totalRevenue > 0 ? ((revenueMap[branch.id] ?? 0) / totalRevenue) * 100 : 0}
              totalRevenue={totalRevenue}
              allTx={allTxLive}
              session={posSessions[branch.id] ?? null}
              onEdit={() => setModalTarget(branch)}
            />
          ))}
          {/* Add new branch card */}
          <button
            onClick={() => setModalTarget('new')}
            className="glass-card p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 border-2 border-dashed transition-all min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
              <Building2 size={22} className="opacity-60" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm">Tambah Cabang Baru</p>
              <p className="text-xs mt-0.5 opacity-70">Klik untuk menambah lokasi</p>
            </div>
          </button>
        </div>
      )}

      {/* ── LIST / TABLE VIEW ── */}
      {view === 'list' && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Daftar Cabang</h3>
            <p className="text-xs text-slate-500 mt-0.5">{branches.length} cabang · kontribusi pendapatan otomatis dihitung dari total kumulatif</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['ID', 'Nama / Kota', 'Telepon / Alamat', 'Manager', 'Kasir', 'Pendapatan & Kontribusi', 'Stok', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branches.map(branch => (
                  <BranchRow
                    key={branch.id}
                    branch={branch}
                    revenueRaw={revenueMap[branch.id] ?? 0}
                    kontribusiPct={totalRevenue > 0 ? ((revenueMap[branch.id] ?? 0) / totalRevenue) * 100 : 0}
                    onEdit={() => setModalTarget(branch)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {(modalTarget === 'new' || (modalTarget && typeof modalTarget === 'object')) && (
        <BranchModal
          initial={modalTarget === 'new' ? null : modalTarget}
          onSave={handleSave}
          onClose={() => setModalTarget(undefined as any)}
        />
      )}
    </div>
  );
}

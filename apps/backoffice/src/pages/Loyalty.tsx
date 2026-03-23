import { useState, useMemo, useEffect } from 'react';
import {
  Gift, Star, Users, TrendingUp, Tag, Plus, Edit2, X, CheckCircle,
  AlertTriangle, Search, ChevronDown, Crown, Ticket, Zap, RotateCcw,
  Settings, Award,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  getVouchers, saveVoucher, saveVouchers, getCustomers, saveOrUpdateCustomer,
  getLoyaltyConfig, saveLoyaltyConfig, getTransactions, getBranches,
  getCustomerTier, calcPointsEarned,
} from '../lib/storage';
import type { Voucher, Customer, LoyaltyConfig, LoyaltyTier } from '../lib/storage';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function maskPhone(phone: string): string {
  if (!phone) return '—';
  // Normalize to display form: 0812-xxx-xx67
  let d = phone;
  if (d.startsWith('62')) d = '0' + d.slice(2);
  if (d.length < 8) return d;
  const prefix = d.slice(0, 4);
  const suffix = d.slice(-2);
  const mid = 'x'.repeat(Math.max(1, d.length - 6));
  return `${prefix}-${mid}-${suffix}`;
}

function fmtRp(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function fmtDate(s: string): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.FC<any>; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-[2rem] p-6 flex items-center gap-5 shadow-sm border border-slate-100">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Tier Badge ───────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: LoyaltyTier }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black ${tier.bgClass} ${tier.colorClass}`}
    >
      <Crown size={10} />
      {tier.name}
    </span>
  );
}

// ─── Voucher Card ─────────────────────────────────────────────────────────────

function VoucherCard({
  voucher, branches, onEdit,
}: {
  voucher: Voucher;
  branches: { id: string; nama: string }[];
  onEdit: (v: Voucher) => void;
}) {
  const isExpired = new Date(voucher.expiry) < new Date();
  const isExhausted = voucher.usageLimit > 0 && voucher.usageCount >= voucher.usageLimit;
  const usagePct = voucher.usageLimit > 0 ? Math.min(100, Math.round((voucher.usageCount / voucher.usageLimit) * 100)) : 0;

  const branchNames = voucher.branchIds.length === 0
    ? 'Semua Cabang'
    : voucher.branchIds.map(id => branches.find(b => b.id === id)?.nama ?? id).join(', ');

  return (
    <div className={`bg-white rounded-[2rem] p-6 border shadow-sm transition-all hover:shadow-md ${
      !voucher.isActive || isExpired || isExhausted
        ? 'border-slate-200 opacity-70'
        : 'border-slate-100'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            voucher.type === 'percentage' ? 'bg-indigo-100' : 'bg-emerald-100'
          }`}>
            {voucher.type === 'percentage'
              ? <Tag size={20} className="text-indigo-600" />
              : <Ticket size={20} className="text-emerald-600" />
            }
          </div>
          <div>
            <p className="font-black text-slate-900 text-lg font-mono tracking-wide">{voucher.code}</p>
            <p className="text-sm text-slate-500 font-medium">{voucher.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!voucher.isActive && (
            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl">Nonaktif</span>
          )}
          {voucher.isActive && isExpired && (
            <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-xl">Kadaluarsa</span>
          )}
          {voucher.isActive && isExhausted && !isExpired && (
            <span className="px-2.5 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-xl">Kuota Habis</span>
          )}
          {voucher.isActive && !isExpired && !isExhausted && (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1">
              <CheckCircle size={11} /> Aktif
            </span>
          )}
          <button
            onClick={() => onEdit(voucher)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-all"
          >
            <Edit2 size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-2xl p-3">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Nilai Diskon</p>
          <p className="font-black text-slate-900 text-base">
            {voucher.type === 'percentage'
              ? `${voucher.value}%${voucher.maxDiscount > 0 ? ` (maks. ${fmtRp(voucher.maxDiscount)})` : ''}`
              : fmtRp(voucher.value)
            }
          </p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Min. Order</p>
          <p className="font-black text-slate-900 text-base">
            {voucher.minOrder > 0 ? fmtRp(voucher.minOrder) : 'Tidak ada'}
          </p>
        </div>
      </div>

      {voucher.usageLimit > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
            <span>Penggunaan</span>
            <span>{voucher.usageCount} / {voucher.usageLimit}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usagePct >= 90 ? 'bg-red-400' : usagePct >= 70 ? 'bg-orange-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
        <span className="flex items-center gap-1">
          <Gift size={11} /> {branchNames}
        </span>
        <span>Berlaku s/d {fmtDate(voucher.expiry)}</span>
      </div>
    </div>
  );
}

// ─── Voucher Modal ────────────────────────────────────────────────────────────

const EMPTY_VOUCHER: Voucher = {
  id: '', code: '', description: '', type: 'percentage', value: 10,
  minOrder: 0, maxDiscount: 0, expiry: '', usageLimit: 0, usageCount: 0,
  branchIds: [], isActive: true, createdAt: '',
};

function VoucherModal({
  voucher, branches, onSave, onClose,
}: {
  voucher: Voucher | null;
  branches: { id: string; nama: string }[];
  onSave: (v: Voucher) => void;
  onClose: () => void;
}) {
  const isNew = !voucher?.id;
  const [form, setForm] = useState<Voucher>(() =>
    voucher ? { ...voucher } : { ...EMPTY_VOUCHER }
  );
  const [err, setErr] = useState('');

  const set = <K extends keyof Voucher>(k: K, v: Voucher[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const toggleBranch = (id: string) => {
    setForm(f => ({
      ...f,
      branchIds: f.branchIds.includes(id)
        ? f.branchIds.filter(b => b !== id)
        : [...f.branchIds, id],
    }));
  };

  const handleSave = () => {
    if (!form.code.trim()) { setErr('Kode voucher wajib diisi'); return; }
    if (!form.expiry) { setErr('Tanggal berlaku wajib diisi'); return; }
    if (form.value <= 0) { setErr('Nilai diskon harus lebih dari 0'); return; }
    const toSave: Voucher = {
      ...form,
      code: form.code.toUpperCase().trim(),
      id: isNew ? `VCH-${Date.now()}` : form.id,
      createdAt: isNew ? new Date().toISOString().slice(0, 10) : form.createdAt,
    };
    onSave(toSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center">
              <Ticket size={18} className="text-white" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {isNew ? 'Buat Voucher Baru' : 'Edit Voucher'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-7 space-y-5 max-h-[70vh] overflow-y-auto">
          {err && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-semibold">
              <AlertTriangle size={15} /> {err}
            </div>
          )}

          {/* Code */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Kode Voucher</label>
            <input
              value={form.code}
              onChange={e => set('code', e.target.value.toUpperCase())}
              placeholder="cth. HEMAT20"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-slate-900 uppercase outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:normal-case placeholder:font-sans"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Deskripsi</label>
            <input
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="cth. Diskon 10% untuk semua menu"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Type toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tipe Diskon</label>
            <div className="flex gap-2">
              <button
                onClick={() => set('type', 'percentage')}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all border-2 ${
                  form.type === 'percentage'
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
              >
                Persentase (%)
              </button>
              <button
                onClick={() => set('type', 'fixed')}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all border-2 ${
                  form.type === 'fixed'
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
              >
                Nominal (Rp)
              </button>
            </div>
          </div>

          {/* Value + maxDiscount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Nilai {form.type === 'percentage' ? '(%)' : '(Rp)'}
              </label>
              <input
                type="number" min={0}
                value={form.value || ''}
                onChange={e => set('value', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Maks. Diskon (Rp)</label>
              <input
                type="number" min={0}
                value={form.maxDiscount || ''}
                onChange={e => set('maxDiscount', parseFloat(e.target.value) || 0)}
                placeholder="0 = tanpa batas"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          {/* Min order + expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Min. Order (Rp)</label>
              <input
                type="number" min={0}
                value={form.minOrder || ''}
                onChange={e => set('minOrder', parseFloat(e.target.value) || 0)}
                placeholder="0 = tidak ada"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Berlaku Hingga</label>
              <input
                type="date"
                value={form.expiry}
                onChange={e => set('expiry', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          {/* Usage limit */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Batas Penggunaan</label>
            <input
              type="number" min={0}
              value={form.usageLimit || ''}
              onChange={e => set('usageLimit', parseInt(e.target.value) || 0)}
              placeholder="0 = tidak terbatas"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Branch checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Berlaku di Cabang</label>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.branchIds.length === 0}
                  onChange={() => set('branchIds', [])}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
                <span className="text-sm font-bold text-slate-700">Semua Cabang</span>
              </label>
              {branches.map(b => (
                <label key={b.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.branchIds.includes(b.id)}
                    onChange={() => toggleBranch(b.id)}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <span className="text-sm text-slate-600">{b.nama} <span className="text-slate-400 text-xs font-mono">({b.id})</span></span>
                </label>
              ))}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div>
              <p className="text-sm font-bold text-slate-800">Status Aktif</p>
              <p className="text-xs text-slate-500">Voucher dapat digunakan pelanggan</p>
            </div>
            <button
              onClick={() => set('isActive', !form.isActive)}
              className={`relative w-12 h-6 rounded-full transition-all ${form.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isActive ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 pb-6 pt-3 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm">
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] py-3 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all text-sm shadow-lg shadow-indigo-600/25"
          >
            {isNew ? 'Buat Voucher' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Adjust Points Modal ──────────────────────────────────────────────────────

function AdjustPointsModal({
  customer, config, onSave, onClose,
}: {
  customer: Customer;
  config: LoyaltyConfig;
  onSave: (c: Customer) => void;
  onClose: () => void;
}) {
  const [adjustment, setAdjustment] = useState('');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const delta = parseInt(adjustment) || 0;
  const newPoints = Math.max(0, customer.points + delta);
  const tier = getCustomerTier(customer.points, config);

  const handleSave = () => {
    if (!adjustment.trim()) { setErr('Masukkan nilai penyesuaian'); return; }
    if (!reason.trim()) { setErr('Masukkan alasan penyesuaian'); return; }
    onSave({ ...customer, points: newPoints });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] w-full max-w-sm shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-slate-50/60">
          <h3 className="text-lg font-black text-slate-900">Sesuaikan Poin</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-7 space-y-5">
          {/* Customer info */}
          <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
              <Crown size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="font-black text-slate-900">{customer.name}</p>
              <p className="text-xs font-mono text-slate-500">{maskPhone(customer.phone)}</p>
              <div className="flex items-center gap-2 mt-1">
                <TierBadge tier={tier} />
                <span className="text-sm font-bold text-amber-700 flex items-center gap-1">
                  <Star size={11} fill="currentColor" /> {customer.points.toLocaleString('id-ID')} poin
                </span>
              </div>
            </div>
          </div>

          {err && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-semibold">
              <AlertTriangle size={15} /> {err}
            </div>
          )}

          {/* Adjustment */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Penyesuaian (+ tambah / - kurang)
            </label>
            <input
              type="number"
              value={adjustment}
              onChange={e => { setAdjustment(e.target.value); setErr(''); }}
              placeholder="cth. +100 atau -50"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            {adjustment !== '' && (
              <p className="text-xs font-semibold mt-1.5">
                <span className="text-slate-500">Hasil: </span>
                <span className={`font-black ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {newPoints.toLocaleString('id-ID')} poin
                </span>
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Alasan</label>
            <input
              value={reason}
              onChange={e => { setReason(e.target.value); setErr(''); }}
              placeholder="cth. Koreksi poin transaksi X"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
        </div>

        <div className="px-7 pb-6 pt-3 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm">
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] py-3 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all text-sm shadow-lg shadow-indigo-600/25"
          >
            Simpan Penyesuaian
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Loyalty() {
  const [tab, setTab] = useState<'ringkasan' | 'voucher' | 'member'>('ringkasan');

  // Data
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loyaltyConfig, setLoyaltyConfig] = useState<LoyaltyConfig>(getLoyaltyConfig());
  const branches = useMemo(() => getBranches().filter(b => b.status === 'active'), []);

  useEffect(() => {
    setVouchers(getVouchers());
    setCustomers(getCustomers());
  }, []);

  // Voucher tab state
  const [voucherSearch, setVoucherSearch] = useState('');
  const [voucherModal, setVoucherModal] = useState<Voucher | null | 'new'>(null);

  // Member tab state
  const [memberSearch, setMemberSearch] = useState('');
  const [memberSort, setMemberSort] = useState<'points' | 'orders' | 'spent' | 'recent'>('points');
  const [adjustModal, setAdjustModal] = useState<Customer | null>(null);

  // Loyalty config edit state
  const [editingConfig, setEditingConfig] = useState(false);
  const [configDraft, setConfigDraft] = useState<LoyaltyConfig>(loyaltyConfig);

  // ── Computed Stats ──────────────────────────────────────────────────────────

  const activeVouchers = useMemo(() =>
    vouchers.filter(v => v.isActive && new Date(v.expiry) >= new Date()).length,
    [vouchers]
  );

  const totalPoints = useMemo(() =>
    customers.reduce((s, c) => s + c.points, 0),
    [customers]
  );

  const transactions = useMemo(() => getTransactions(), []);

  const totalDiscountGiven = useMemo(() =>
    transactions.reduce((s, tx) => s + (tx.discount ?? 0), 0),
    [transactions]
  );

  // Voucher usage bar chart — last 7 days
  const chartData = useMemo(() => {
    const days = getLast7Days();
    return days.map(day => {
      const dayTx = transactions.filter(tx => tx.date?.slice(0, 10) === day);
      const totalDiscount = dayTx.reduce((s, tx) => s + (tx.discount ?? 0), 0);
      return {
        day: new Date(day).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
        diskon: totalDiscount,
        transaksi: dayTx.length,
      };
    });
  }, [transactions]);

  // Top 5 members
  const top5Members = useMemo(() =>
    [...customers].sort((a, b) => b.points - a.points).slice(0, 5),
    [customers]
  );

  // Filtered vouchers
  const filteredVouchers = useMemo(() => {
    const q = voucherSearch.toLowerCase();
    return vouchers.filter(v =>
      v.code.toLowerCase().includes(q) || v.description.toLowerCase().includes(q)
    );
  }, [vouchers, voucherSearch]);

  // Filtered + sorted members
  const filteredMembers = useMemo(() => {
    const q = memberSearch.toLowerCase();
    const filtered = customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
    return filtered.sort((a, b) => {
      if (memberSort === 'points')  return b.points - a.points;
      if (memberSort === 'orders')  return b.totalOrders - a.totalOrders;
      if (memberSort === 'spent')   return b.totalSpent - a.totalSpent;
      if (memberSort === 'recent')  return b.lastVisit.localeCompare(a.lastVisit);
      return 0;
    });
  }, [customers, memberSearch, memberSort]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSaveVoucher = (v: Voucher) => {
    saveVoucher(v);
    setVouchers(getVouchers());
    setVoucherModal(null);
  };

  const handleSaveCustomer = (c: Customer) => {
    saveOrUpdateCustomer(c);
    setCustomers(getCustomers());
    setAdjustModal(null);
  };

  const handleSaveLoyaltyConfig = () => {
    saveLoyaltyConfig(configDraft);
    setLoyaltyConfig(configDraft);
    setEditingConfig(false);
  };

  const updateTierField = (idx: number, field: keyof LoyaltyTier, value: string | number) => {
    setConfigDraft(prev => {
      const tiers = prev.tiers.map((t, i) => i === idx ? { ...t, [field]: value } : t);
      return { ...prev, tiers };
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const TABS = [
    { id: 'ringkasan', label: 'Ringkasan', icon: TrendingUp },
    { id: 'voucher',   label: 'Voucher & Promo', icon: Ticket },
    { id: 'member',    label: 'Poin & Member', icon: Users },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="bg-white rounded-[2rem] p-2 flex gap-1 shadow-sm border border-slate-100 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
              tab === id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB: RINGKASAN ── */}
      {tab === 'ringkasan' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard icon={Ticket}     label="Voucher Aktif"        value={activeVouchers}    sub={`dari ${vouchers.length} total voucher`}        color="bg-indigo-600" />
            <StatCard icon={Users}      label="Total Member"         value={customers.length}  sub="pelanggan terdaftar"                            color="bg-emerald-600" />
            <StatCard icon={Star}       label="Poin Beredar"         value={totalPoints.toLocaleString('id-ID')} sub={`≈ ${fmtRp(totalPoints * 100)}`} color="bg-amber-500" />
            <StatCard icon={TrendingUp} label="Total Diskon Diberikan" value={fmtRp(totalDiscountGiven)} sub="semua transaksi"                        color="bg-rose-500" />
          </div>

          {/* Chart + Top Members */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="xl:col-span-2 bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Diskon Diberikan</h3>
                  <p className="text-sm text-slate-400 font-medium">7 hari terakhir</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <TrendingUp size={18} className="text-indigo-600" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number) => [fmtRp(v), 'Total Diskon']}
                    contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600 }}
                  />
                  <Bar dataKey="diskon" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Members */}
            <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-slate-900 text-lg">Top Member</h3>
                <Award size={18} className="text-amber-500" />
              </div>
              {top5Members.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-300 gap-2">
                  <Users size={32} className="opacity-50" />
                  <p className="text-sm font-semibold">Belum ada member</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {top5Members.map((c, i) => {
                    const tier = getCustomerTier(c.points, loyaltyConfig);
                    return (
                      <div key={c.id} className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          i === 0 ? 'bg-amber-400 text-white' :
                          i === 1 ? 'bg-slate-300 text-white' :
                          i === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">{c.name}</p>
                          <TierBadge tier={tier} />
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-amber-600 flex items-center gap-1">
                            <Star size={11} fill="currentColor" /> {c.points.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: VOUCHER & PROMO ── */}
      {tab === 'voucher' && (
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={voucherSearch}
                onChange={e => setVoucherSearch(e.target.value)}
                placeholder="Cari kode atau deskripsi..."
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
              />
            </div>
            <button
              onClick={() => setVoucherModal('new')}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/25 shrink-0"
            >
              <Plus size={16} /> Buat Voucher
            </button>
          </div>

          {filteredVouchers.length === 0 ? (
            <div className="bg-white rounded-[2rem] py-16 flex flex-col items-center text-slate-300 border border-slate-100 shadow-sm gap-3">
              <Ticket size={40} className="opacity-50" />
              <p className="font-bold text-slate-400">Tidak ada voucher ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredVouchers.map(v => (
                <VoucherCard
                  key={v.id}
                  voucher={v}
                  branches={branches}
                  onEdit={setVoucherModal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: POIN & MEMBER ── */}
      {tab === 'member' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Loyalty Settings */}
          <div className="space-y-5">
            {/* Config Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <Settings size={18} className="text-indigo-600" />
                  </div>
                  <h3 className="font-black text-slate-900">Pengaturan Poin</h3>
                </div>
                {!editingConfig ? (
                  <button
                    onClick={() => { setConfigDraft(loyaltyConfig); setEditingConfig(true); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-all"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingConfig(false)}
                      className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveLoyaltyConfig}
                      className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all"
                    >
                      Simpan
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Earn Rate (1 poin per Rp)
                  </label>
                  {editingConfig ? (
                    <input
                      type="number" min={1000}
                      value={configDraft.earnRate}
                      onChange={e => setConfigDraft(p => ({ ...p, earnRate: parseInt(e.target.value) || p.earnRate }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  ) : (
                    <p className="text-slate-800 font-bold text-base">{fmtRp(loyaltyConfig.earnRate)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Redeem Rate (1 poin = Rp)
                  </label>
                  {editingConfig ? (
                    <input
                      type="number" min={1}
                      value={configDraft.redeemRate}
                      onChange={e => setConfigDraft(p => ({ ...p, redeemRate: parseInt(e.target.value) || p.redeemRate }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  ) : (
                    <p className="text-slate-800 font-bold text-base">Rp {loyaltyConfig.redeemRate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tier Config */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <Crown size={18} className="text-amber-500" />
                </div>
                <h3 className="font-black text-slate-900">Tier Member</h3>
              </div>

              <div className="space-y-3">
                {(editingConfig ? configDraft : loyaltyConfig).tiers.map((tier, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border ${tier.bgClass} border-slate-100`}>
                    {editingConfig ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            value={configDraft.tiers[idx].name}
                            onChange={e => updateTierField(idx, 'name', e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-indigo-500"
                          />
                          <input
                            type="number"
                            value={configDraft.tiers[idx].minPoints}
                            onChange={e => updateTierField(idx, 'minPoints', parseInt(e.target.value) || 0)}
                            placeholder="Min pts"
                            className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500"
                          />
                        </div>
                        <input
                          type="number" step="0.1"
                          value={configDraft.tiers[idx].bonusMultiplier}
                          onChange={e => updateTierField(idx, 'bonusMultiplier', parseFloat(e.target.value) || 1)}
                          placeholder="Multiplier"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <TierBadge tier={tier} />
                          <p className="text-xs text-slate-500 mt-1.5 font-medium">
                            Min. {tier.minPoints.toLocaleString('id-ID')} poin
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-500">Bonus</p>
                          <p className="font-black text-slate-800">×{tier.bonusMultiplier}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Member List */}
          <div className="xl:col-span-2 space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  placeholder="Cari nama atau nomor HP..."
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                />
              </div>
              <div className="relative shrink-0">
                <select
                  value={memberSort}
                  onChange={e => setMemberSort(e.target.value as typeof memberSort)}
                  className="appearance-none bg-white border border-slate-200 rounded-2xl pl-4 pr-9 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
                >
                  <option value="points">Urut: Poin</option>
                  <option value="orders">Urut: Kunjungan</option>
                  <option value="spent">Urut: Total Belanja</option>
                  <option value="recent">Urut: Terbaru</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="bg-white rounded-[2rem] py-16 flex flex-col items-center text-slate-300 border border-slate-100 shadow-sm gap-3">
                <Users size={40} className="opacity-50" />
                <p className="font-bold text-slate-400">
                  {memberSearch ? 'Member tidak ditemukan' : 'Belum ada member terdaftar'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>Member</span>
                  <span>Telepon</span>
                  <span>Poin</span>
                  <span>Kunjungan</span>
                  <span>Terakhir</span>
                  <span />
                </div>

                <div className="divide-y divide-slate-50 max-h-[calc(100vh-22rem)] overflow-y-auto">
                  {filteredMembers.map(c => {
                    const tier = getCustomerTier(c.points, loyaltyConfig);
                    return (
                      <div
                        key={c.id}
                        className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-slate-900 text-sm truncate">{c.name}</p>
                            <TierBadge tier={tier} />
                          </div>
                          <p className="text-xs text-slate-400 font-mono">{maskPhone(c.phone)}</p>
                        </div>
                        <span className="text-sm font-mono text-slate-500">{maskPhone(c.phone)}</span>
                        <div>
                          <p className="text-sm font-black text-amber-600 flex items-center gap-1">
                            <Star size={11} fill="currentColor" />
                            {c.points.toLocaleString('id-ID')}
                          </p>
                          <p className="text-[10px] text-slate-400">{fmtRp(c.points * loyaltyConfig.redeemRate)}</p>
                        </div>
                        <p className="text-sm font-bold text-slate-700">{c.totalOrders}×</p>
                        <p className="text-xs text-slate-500">{fmtDate(c.lastVisit)}</p>
                        <button
                          onClick={() => setAdjustModal(c)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-all whitespace-nowrap"
                        >
                          <Zap size={12} /> Sesuaikan
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {voucherModal !== null && (
        <VoucherModal
          voucher={voucherModal === 'new' ? null : voucherModal}
          branches={branches}
          onSave={handleSaveVoucher}
          onClose={() => setVoucherModal(null)}
        />
      )}

      {adjustModal && (
        <AdjustPointsModal
          customer={adjustModal}
          config={loyaltyConfig}
          onSave={handleSaveCustomer}
          onClose={() => setAdjustModal(null)}
        />
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import {
  UserCog, Shield, User, CreditCard, Plus, Search, X, Phone,
  Mail, Eye, EyeOff, AlertTriangle, Truck, Crown, Star, Gift,
  ChevronDown, ChevronUp, Users2, RefreshCw,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppUser {
  id: string;
  role: string;
  phoneNumber: string | null;
  email: string | null;
  fullName: string;
  points: number;
  branchId: string | null;
  createdAt: string;
}

// ─── API Helpers ──────────────────────────────────────────────────────────────

function getToken(): string {
  return localStorage.getItem('bo_token') || '';
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...(opts?.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Gagal memproses');
  return json.data;
}

// ─── Tabs Config ──────────────────────────────────────────────────────────────

type TabId = 'customer' | 'driver' | 'cashier' | 'admin' | 'loyalty';

const TABS: { id: TabId; label: string; icon: React.FC<any>; roleFilter?: string }[] = [
  { id: 'customer', label: 'Customer',   icon: Users2,     roleFilter: 'customer' },
  { id: 'driver',   label: 'Driver',     icon: Truck,      roleFilter: 'driver'   },
  { id: 'cashier',  label: 'Kasir',      icon: CreditCard, roleFilter: 'cashier'  },
  { id: 'admin',    label: 'Admin',      icon: Shield,     roleFilter: 'admin'    },
  { id: 'loyalty',  label: 'Loyalty & Promo', icon: Gift                           },
];

const roleColors: Record<string, { bg: string; text: string; badge: string }> = {
  customer: { bg: 'bg-blue-100',    text: 'text-blue-700',    badge: 'bg-blue-50 text-blue-700 border-blue-200'     },
  driver:   { bg: 'bg-orange-100',  text: 'text-orange-700',  badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  cashier:  { bg: 'bg-emerald-100', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  admin:    { bg: 'bg-indigo-100',  text: 'text-indigo-700',  badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  master:   { bg: 'bg-red-100',     text: 'text-red-700',     badge: 'bg-red-50 text-red-700 border-red-200'        },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(s: string | null): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtPhone(phone: string | null): string {
  if (!phone) return '—';
  if (phone.startsWith('62')) return '0' + phone.slice(2);
  return phone;
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const c = roleColors[role] || roleColors.customer;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${c.badge}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

// ─── Add Staff Modal ──────────────────────────────────────────────────────────

function AddStaffModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', email: '', password: '', role: 'cashier' as 'cashier' | 'admin' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!form.fullName.trim()) { setError('Nama lengkap wajib diisi'); return; }
    if (!form.phoneNumber.trim()) { setError('Nomor HP wajib diisi'); return; }
    if (!form.password || form.password.length < 6) { setError('Password minimal 6 karakter'); return; }
    setLoading(true);
    try {
      await apiFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          email: form.email.trim() || undefined,
          password: form.password,
          role: form.role,
        }),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center">
              <Plus size={18} className="text-white" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Tambah Kasir / Admin Baru</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-7 space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-semibold">
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nama Lengkap</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                placeholder="Masukkan nama lengkap"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Nomor HP <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={form.phoneNumber}
                onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                placeholder="08xxx / 628xxx"
                type="tel"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email (Opsional)</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@contoh.com"
                type="email"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <input
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Minimal 6 karakter"
                type={showPw ? 'text' : 'password'}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pr-12 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Pilihan Role</label>
            <div className="flex gap-2">
              {(['cashier', 'admin'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all border-2 ${
                    form.role === r
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}
                >
                  {r === 'cashier' ? '🏪 Kasir' : '🛡️ Admin'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 pb-6 pt-3 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] py-3 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all text-sm shadow-lg shadow-indigo-600/25 disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Tambah User'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Users Table ──────────────────────────────────────────────────────────────

function UsersTable({ users, search, loading }: { users: AppUser[]; search: string; loading: boolean }) {
  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      u.fullName.toLowerCase().includes(q) ||
      (u.phoneNumber || '').includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  if (loading) {
    return (
      <div className="glass-card py-16 flex flex-col items-center gap-3">
        <RefreshCw size={32} className="text-slate-300 animate-spin" />
        <p className="text-slate-400 font-semibold">Memuat data...</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="glass-card py-16 flex flex-col items-center gap-3">
        <UserCog size={40} className="text-slate-200" />
        <p className="text-slate-400 font-semibold">Tidak ada user ditemukan</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100">
        <p className="text-sm font-bold text-slate-800">{filtered.length} pengguna ditemukan</p>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {['Pengguna', 'Nomor HP', 'Role', 'Poin', 'Terdaftar'].map(h => (
              <th key={h} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.map(user => {
            const rc = roleColors[user.role] || roleColors.customer;
            return (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black ${rc.bg} ${rc.text}`}>
                      {user.fullName.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{user.fullName || '(Tanpa Nama)'}</p>
                      {user.email && <p className="text-xs text-slate-400">{user.email}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600 font-mono">{fmtPhone(user.phoneNumber)}</td>
                <td className="px-5 py-4"><RoleBadge role={user.role} /></td>
                <td className="px-5 py-4">
                  {user.points > 0 ? (
                    <span className="text-sm font-bold text-amber-600 flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> {user.points.toLocaleString('id-ID')}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-300">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-xs text-slate-400">{fmtDate(user.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Loyalty Tab ──────────────────────────────────────────────────────────────

function LoyaltyTab({ allUsers }: { allUsers: AppUser[] }) {
  const customers = useMemo(() =>
    allUsers
      .filter(u => u.role === 'customer' && u.points > 0)
      .sort((a, b) => b.points - a.points),
    [allUsers]
  );

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-5">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shrink-0">
            <Crown size={24} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Top Customer</p>
            <p className="text-lg font-black text-slate-900">{customers[0]?.fullName || '—'}</p>
            {customers[0] && (
              <p className="text-xs text-amber-600 font-bold flex items-center gap-1">
                <Star size={10} fill="currentColor" /> {customers[0].points.toLocaleString('id-ID')} pts
              </p>
            )}
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0">
            <Users2 size={24} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Customer Berpoin</p>
            <p className="text-2xl font-black text-slate-900">{customers.length}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0">
            <Star size={24} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Poin Beredar</p>
            <p className="text-2xl font-black text-slate-900">
              {customers.reduce((s, c) => s + c.points, 0).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 bg-amber-50/60 border-b border-amber-100 flex items-center gap-3">
          <Crown size={16} className="text-amber-600" />
          <span className="text-sm font-bold text-amber-900">Leaderboard — Customer Poin Tertinggi</span>
        </div>
        {customers.length === 0 ? (
          <div className="py-16 text-center">
            <Star size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">Belum ada customer dengan poin</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['#', 'Customer', 'Nomor HP', 'Poin', 'Terdaftar'].map(h => (
                  <th key={h} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.slice(0, 20).map((c, i) => (
                <tr key={c.id} className="hover:bg-amber-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                      i === 0 ? 'bg-amber-400 text-white' :
                      i === 1 ? 'bg-slate-300 text-white' :
                      i === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold text-slate-800">{c.fullName || '(Tanpa Nama)'}</p>
                    {c.email && <p className="text-xs text-slate-400">{c.email}</p>}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600 font-mono">{fmtPhone(c.phoneNumber)}</td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-black text-amber-600 flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> {c.points.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400">{fmtDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Users() {
  const [tab, setTab] = useState<TabId>('customer');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/admin/users');
      setAllUsers(data);
    } catch {
      // Fallback: empty list if API not available
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const currentTab = TABS.find(t => t.id === tab)!;
  const usersForTab = currentTab.roleFilter
    ? allUsers.filter(u => u.role === currentTab.roleFilter)
    : allUsers;

  const counts = useMemo(() => ({
    customer: allUsers.filter(u => u.role === 'customer').length,
    driver: allUsers.filter(u => u.role === 'driver').length,
    cashier: allUsers.filter(u => u.role === 'cashier').length,
    admin: allUsers.filter(u => u.role === 'admin' || u.role === 'master').length,
    loyalty: allUsers.filter(u => u.role === 'customer' && u.points > 0).length,
  }), [allUsers]);

  return (
    <div className="space-y-5">
      {/* Tab Bar */}
      <div className="bg-white rounded-[2rem] p-2 flex gap-1 shadow-sm border border-slate-100 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setSearch(''); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
              tab === id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <Icon size={16} />
            {label}
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-black ${
              tab === id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {counts[id]}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      {tab !== 'loyalty' && (
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Cari ${currentTab.label}...`}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            {(tab === 'cashier' || tab === 'admin') && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm shadow-indigo-200 active:scale-95 transition-all"
              >
                <Plus size={15} />
                Tambah {tab === 'cashier' ? 'Kasir' : 'Admin'} Baru
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {tab === 'loyalty' ? (
        <LoyaltyTab allUsers={allUsers} />
      ) : (
        <UsersTable users={usersForTab} search={search} loading={loading} />
      )}

      {/* Modal */}
      {showModal && (
        <AddStaffModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchUsers(); }}
        />
      )}
    </div>
  );
}

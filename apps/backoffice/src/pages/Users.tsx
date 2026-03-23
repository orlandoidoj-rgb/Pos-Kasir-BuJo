import { useState } from 'react';
import { UserCog, Shield, User, CreditCard, Plus, Search, ChevronDown, ChevronUp } from 'lucide-react';

type Role = 'master_admin' | 'admin' | 'kasir';

interface AppUser {
  id: string;
  nama: string;
  email: string;
  role: Role;
  cabang: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar: string;
}

const users: AppUser[] = [
  { id: 'USR-001', nama: 'Jodi Admin', email: 'jodi@warungbujo.id', role: 'master_admin', cabang: 'Semua Cabang', status: 'active', lastLogin: '2026-03-19 08:30', avatar: 'JD' },
  { id: 'USR-002', nama: 'Budi Santoso', email: 'budi@warungbujo.id', role: 'admin', cabang: 'Malang Pusat', status: 'active', lastLogin: '2026-03-19 09:15', avatar: 'BS' },
  { id: 'USR-003', nama: 'Siti Rahayu', email: 'siti@warungbujo.id', role: 'admin', cabang: 'Malang Kayutangan', status: 'active', lastLogin: '2026-03-18 17:00', avatar: 'SR' },
  { id: 'USR-004', nama: 'Ahmad Kasir', email: 'ahmad@warungbujo.id', role: 'kasir', cabang: 'Malang Pusat', status: 'active', lastLogin: '2026-03-19 10:00', avatar: 'AH' },
  { id: 'USR-005', nama: 'Dewi Kasir', email: 'dewi@warungbujo.id', role: 'kasir', cabang: 'Malang Pusat', status: 'active', lastLogin: '2026-03-19 10:05', avatar: 'DW' },
  { id: 'USR-006', nama: 'Roni Kasir', email: 'roni@warungbujo.id', role: 'kasir', cabang: 'Malang Kayutangan', status: 'active', lastLogin: '2026-03-18 22:30', avatar: 'RN' },
  { id: 'USR-007', nama: 'Agus Kurniawan', email: 'agus@warungbujo.id', role: 'admin', cabang: 'Surabaya Barat', status: 'active', lastLogin: '2026-03-17 14:20', avatar: 'AK' },
  { id: 'USR-008', nama: 'Lina (Nonaktif)', email: 'lina@warungbujo.id', role: 'kasir', cabang: 'Malang Pusat', status: 'inactive', lastLogin: '2026-02-15 09:00', avatar: 'LN' },
];

const roleConfig = {
  master_admin: {
    label: 'Master Admin',
    icon: Shield,
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    avatarBg: 'bg-red-100',
    desc: 'Akses penuh semua cabang, laporan keuangan, dan pengaturan sistem.',
  },
  admin: {
    label: 'Admin',
    icon: User,
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    avatarBg: 'bg-indigo-100',
    desc: 'Kelola cabang sendiri: inventory, stok, CRM, dan laporan cabang.',
  },
  kasir: {
    label: 'Kasir',
    icon: CreditCard,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    avatarBg: 'bg-emerald-100',
    desc: 'Hanya akses POS: transaksi, mutasi stok, dan laporan shift harian.',
  },
};

const accessMatrix = [
  { fitur: 'Dashboard Pusat (Semua Cabang)', master_admin: true, admin: false, kasir: false },
  { fitur: 'Dashboard Cabang Sendiri', master_admin: true, admin: true, kasir: false },
  { fitur: 'Kelola Cabang', master_admin: true, admin: false, kasir: false },
  { fitur: 'Inventory & BOM', master_admin: true, admin: true, kasir: false },
  { fitur: 'Finance & Jurnal', master_admin: true, admin: false, kasir: false },
  { fitur: 'CRM / Partners', master_admin: true, admin: true, kasir: false },
  { fitur: 'User Management', master_admin: true, admin: false, kasir: false },
  { fitur: 'Kasir / POS', master_admin: true, admin: true, kasir: true },
  { fitur: 'Laporan Shift Harian', master_admin: true, admin: true, kasir: true },
];

function RoleBadge({ role }: { role: Role }) {
  const cfg = roleConfig[role];
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.color} border ${cfg.border} whitespace-nowrap`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

export default function Users() {
  const [filterRole, setFilterRole] = useState<Role | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showMatrix, setShowMatrix] = useState(false);

  const filtered = users.filter(u => {
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchSearch =
      u.nama.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.cabang.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Role Cards */}
      <div className="grid grid-cols-3 gap-5">
        {(Object.entries(roleConfig) as [Role, typeof roleConfig[Role]][]).map(([role, cfg]) => {
          const Icon = cfg.icon;
          const count = users.filter(u => u.role === role).length;
          return (
            <div key={role} className={`glass-card p-5 border ${cfg.border} hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                  <Icon size={20} className={cfg.color} />
                </div>
                <span className={`text-2xl font-black ${cfg.color}`}>{count}</span>
              </div>
              <p className={`text-sm font-bold ${cfg.color} mb-1`}>{cfg.label}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{cfg.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Access Matrix */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => setShowMatrix(!showMatrix)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Shield size={17} className="text-indigo-600" />
            <span className="text-sm font-bold text-slate-800">Matriks Hak Akses per Role</span>
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-200 text-[11px] font-semibold rounded-full">
              {accessMatrix.length} fitur
            </span>
          </div>
          {showMatrix
            ? <ChevronUp size={16} className="text-slate-400" />
            : <ChevronDown size={16} className="text-slate-400" />
          }
        </button>

        {showMatrix && (
          <div className="border-t border-slate-100 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fitur</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-red-600 uppercase tracking-wider text-center">Master Admin</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-indigo-600 uppercase tracking-wider text-center">Admin</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-emerald-600 uppercase tracking-wider text-center">Kasir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accessMatrix.map(row => (
                  <tr key={row.fitur} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-700">{row.fitur}</td>
                    <td className="px-6 py-3 text-center text-base">{row.master_admin ? '✅' : <span className="text-slate-300">—</span>}</td>
                    <td className="px-6 py-3 text-center text-base">{row.admin ? '✅' : <span className="text-slate-300">—</span>}</td>
                    <td className="px-6 py-3 text-center text-base">{row.kasir ? '✅' : <span className="text-slate-300">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {(['all', 'master_admin', 'admin', 'kasir'] as const).map(r => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                filterRole === r
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {r === 'all' ? 'Semua' : roleConfig[r].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari user..."
              className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 transition-all w-52 placeholder:text-slate-400"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm shadow-indigo-200 active:scale-95 transition-all">
            <Plus size={15} />
            Tambah User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-800">
            {filtered.length} pengguna ditemukan
          </p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Pengguna', 'Role', 'Cabang', 'Last Login', 'Status', 'Aksi'].map(h => (
                <th key={h} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(user => {
              const cfg = roleConfig[user.role];
              return (
                <tr
                  key={user.id}
                  className={`hover:bg-slate-50 transition-colors ${user.status === 'inactive' ? 'opacity-50' : ''}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black ${cfg.avatarBg} ${cfg.color}`}>
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{user.nama}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{user.cabang}</td>
                  <td className="px-5 py-4 text-xs font-mono text-slate-400">{user.lastLogin}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                      user.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-xs font-semibold rounded-lg transition-all">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-semibold rounded-lg transition-all">
                        Reset PW
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <UserCog size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">Tidak ada user ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}

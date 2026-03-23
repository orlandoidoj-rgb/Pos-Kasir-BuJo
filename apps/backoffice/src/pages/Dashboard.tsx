import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  Wallet,
  Store,
} from 'lucide-react';
import { getPOSSessions, getTransactions } from '../lib/storage';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const DATA = [
  { name: 'Sen', pendapatan: 4000, cost: 2400 },
  { name: 'Sel', pendapatan: 3000, cost: 1398 },
  { name: 'Rab', pendapatan: 5200, cost: 2800 },
  { name: 'Kam', pendapatan: 2780, cost: 1908 },
  { name: 'Jum', pendapatan: 4890, cost: 2400 },
  { name: 'Sab', pendapatan: 6390, cost: 3200 },
  { name: 'Min', pendapatan: 3490, cost: 1800 },
];

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  isUp?: boolean;
  icon: React.ReactNode;
  iconBg: string;
  accent: string;
}
function StatCard({ label, value, change, isUp, icon, iconBg, accent }: StatCardProps) {
  return (
    <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBg} shadow-sm group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 font-headline font-bold text-sm px-3 py-1.5 rounded-full ${
          isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
        }`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      </div>
      <p className="font-headline font-bold text-slate-400 uppercase tracking-widest text-xs mb-3">{label}</p>
      <h2 className="text-4xl font-headline font-black text-slate-900">{value}</h2>
      <div className={`mt-6 h-1.5 rounded-full ${accent} opacity-20`} />
    </div>
  );
}

interface JournalItemProps {
  code: string;
  name: string;
  balance: string;
  type: string;
  warning?: boolean;
}
function JournalItem({ code, name, balance, type, warning }: JournalItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 -mx-2 px-2 rounded-xl transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center font-mono text-[10px] font-bold text-indigo-600 border border-indigo-100">
          {code}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">{name}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">{type}</p>
        </div>
      </div>
      <span className={`text-sm font-black ${warning ? 'text-red-500' : 'text-indigo-600'}`}>
        {balance}
      </span>
    </div>
  );
}

interface InventoryRowProps {
  refId: string;
  product: string;
  branch: string;
  qty: string;
  type: 'in' | 'out' | 'adj';
}
function InventoryRow({ refId, product, branch, qty, type }: InventoryRowProps) {
  const typeStyle = {
    out: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    in:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
    adj: 'bg-amber-50 text-amber-700 border border-amber-200',
  };
  const typeLabel = { out: 'Penjualan', in: 'Restock', adj: 'Koreksi' };

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-5 py-3.5 text-xs font-mono text-slate-500">{refId}</td>
      <td className="px-5 py-3.5">
        <p className="text-sm font-semibold text-slate-800">{product}</p>
        <p className="text-[10px] text-slate-400 uppercase">Item SKU</p>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm text-slate-600">{branch}</span>
        </div>
      </td>
      <td className={`px-5 py-3.5 text-sm font-black ${qty.startsWith('-') ? 'text-red-500' : 'text-emerald-600'}`}>
        {qty}
      </td>
      <td className="px-5 py-3.5">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${typeStyle[type]}`}>
          {typeLabel[type]}
        </span>
      </td>
    </tr>
  );
}

export default function Dashboard() {
  const [liveTick, setLiveTick] = useState(0);
  useEffect(() => {
    const refresh = () => setLiveTick(t => t + 1);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('focus', refresh); window.removeEventListener('storage', refresh); };
  }, []);

  const sessions      = getPOSSessions();          // eslint-disable-line react-hooks/exhaustive-deps
  const allTx         = getTransactions();          // eslint-disable-line react-hooks/exhaustive-deps
  const cabangBuka    = Object.values(sessions).filter(s => s.active);
  const totalPendapatan = allTx.reduce((s, t) => s + t.total, 0);

  // re-read on liveTick changes
  void liveTick;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-headline font-black text-slate-900 tracking-tight">Executive Overview</h1>
        <p className="text-lg text-slate-500 font-medium">Ringkasan performa bisnis real-time</p>
      </div>

      {/* Cabang Buka Live Banner */}
      {cabangBuka.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-bold text-green-800 text-sm">{cabangBuka.length} Cabang Sedang Buka (POS Aktif)</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {cabangBuka.map(s => (
              <div key={s.branchId} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-green-200 rounded-xl">
                <Store size={13} className="text-green-600" />
                <span className="text-xs font-bold text-green-800">{s.branchName}</span>
                <span className="text-xs text-green-500">· {s.cashierName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          label="Total Pendapatan"
          value={totalPendapatan > 0 ? `Rp ${(totalPendapatan / 1000000).toFixed(1)}M` : 'Rp 12,8M'}
          change="+12.5%"
          isUp
          icon={<TrendingUp size={24} className="text-primary" />}
          iconBg="bg-primary/10"
          accent="bg-primary"
        />
        <StatCard
          label="Total Orders"
          value="1.280"
          change="+8.2%"
          isUp
          icon={<ShoppingCart size={24} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
          accent="bg-emerald-500"
        />
        <StatCard
          label="Stock SKU"
          value="48"
          change="-2 item"
          icon={<Package size={24} className="text-amber-600" />}
          iconBg="bg-amber-50"
          accent="bg-amber-500"
        />
        <StatCard
          label="Active Partners"
          value="2.400"
          change="+45"
          isUp
          icon={<Users size={24} className="text-violet-600" />}
          iconBg="bg-violet-50"
          accent="bg-violet-500"
        />
      </div>

      {/* Chart & Buku Besar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-headline font-bold text-slate-900">Performa Penjualan</h3>
              <p className="text-base text-slate-500 mt-1 font-medium">Pendapatan mingguan vs HPP</p>
            </div>
            <select className="text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none cursor-pointer hover:border-primary/30 transition-all">
              <option>Past 7 Days</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e40af" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={13} fontWeight="600" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} fontWeight="600" tickLine={false} axisLine={false} width={50}
                  tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                />
                <Area type="monotone" dataKey="pendapatan" name="Pendapatan" stroke="#1e40af" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="cost" name="HPP" stroke="#f59e0b" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Buku Besar */}
        <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-headline font-bold text-slate-900 flex items-center gap-3">
              <Wallet size={24} className="text-primary" />
              Ledger
            </h3>
            <span className="text-[11px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">Live</span>
          </div>
          <div className="flex-1 space-y-2">
            <JournalItem code="1101" name="Kas Tanah Abang" type="Asset" balance="Rp 4,5M" />
            <JournalItem code="4101" name="Pendapatan Penjualan" type="Revenue" balance="Rp 12,8M" />
            <JournalItem code="5101" name="HPP / Beban Pokok" type="Expense" balance="Rp 5,2M" />
            <JournalItem code="1401" name="Persediaan Bahan" type="Asset" balance="Rp 820K" warning />
          </div>
          <button className="mt-8 w-full py-4 bg-primary text-white rounded-2xl text-base font-bold transition-all shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95">
            View Full Report →
          </button>
        </div>
      </div>

      {/* Mutasi Stok */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="text-2xl font-headline font-bold text-slate-900">Recent Inventory Movements</h3>
          <button className="text-primary font-bold hover:underline transition-all">
            View All History →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Reference</th>
                <th className="px-10 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Product</th>
                <th className="px-10 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Branch</th>
                <th className="px-10 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Qty</th>
                <th className="px-10 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <InventoryRow refId="POS-9201" product="Ayam Goreng" branch="Malang Pusat" qty="-100 gr" type="out" />
              <InventoryRow refId="SUP-1021" product="Beras Pandan" branch="Surabaya Barat" qty="+20 Kg" type="in" />
              <InventoryRow refId="POS-9202" product="Es Teh Manis" branch="Malang Pusat" qty="-45 pcs" type="out" />
              <InventoryRow refId="ADJ-0012" product="Sambal Terasi" branch="Malang Kayutangan" qty="-2 Kg" type="adj" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

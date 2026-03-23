import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Calendar, 
  Filter, 
  ChevronDown, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Wallet,
  Building,
  CreditCard
} from 'lucide-react';
import { getTransactions, loadAccounts } from '../../lib/storage';

const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export default function BalanceSheet() {
  const [period, setPeriod] = useState('2026-03'); // Default March 2026
  
  const allTx = useMemo(() => getTransactions(), []);
  const accounts = useMemo(() => loadAccounts(), []);

  // Simplified logic for Demo: 
  // Normally would calculate actual balances from journal entries.
  // Here we'll simulate based on account categories and total revenue.
  const revenue = useMemo(() => {
    return allTx.filter(tx => tx.date.startsWith(period)).reduce((s, t) => s + t.total, 0);
  }, [allTx, period]);

  const cogs = useMemo(() => {
    return allTx.filter(tx => tx.date.startsWith(period)).reduce((s, t) => s + t.totalCOGS, 0);
  }, [allTx, period]);

  const calcBalance = (accountCode: string, base: number) => {
    // Dynamic simulation for demo
    if (accountCode.startsWith('1')) return base * 0.4; // Assets
    if (accountCode.startsWith('2')) return base * 0.15; // Liabilities
    if (accountCode.startsWith('3')) return base * 0.45; // Equity
    return 0;
  };

  const assets = [
    { name: 'Kas & Setara Kas', code: '1101', amount: 45200000 + revenue * 0.6 },
    { name: 'Bank BCA', code: '1102', amount: 120500000 },
    { name: 'Piutang Usaha', code: '1201', amount: 8400000 },
    { name: 'Persediaan Bahan Baku', code: '1401', amount: 32000000 - cogs * 0.3 },
  ];

  const liabilities = [
    { name: 'Hutang Dagang', code: '2101', amount: 12500000 },
    { name: 'Hutang Gaji', code: '2102', amount: 4500000 },
  ];

  const equity = [
    { name: 'Modal Disetor', code: '3101', amount: 150000000 },
    { name: 'Laba Ditahan', code: '3201', amount: 24500000 + (revenue - cogs) * 0.4 },
  ];

  const totalAssets = assets.reduce((s, a) => s + a.amount, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.amount, 0);
  const totalEquity = equity.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-8 pb-20">
      {/* Period Selector */}
      <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-xl leading-none">Neraca Keuangan</h3>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Balance Sheet Report</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <select 
             value={period} 
             onChange={(e) => setPeriod(e.target.value)}
             className="px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer pr-12 relative"
           >
             <option value="2026-03">Maret 2026</option>
             <option value="2026-02">Februari 2026</option>
             <option value="2026-01">Januari 2026</option>
             <option value="2025-12">Desember 2025</option>
           </select>
           <button className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all">
             <Filter size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ASSETS */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4">
             <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <Wallet size={20} />
             </div>
             <h4 className="text-xl font-black text-slate-800">AKTIVA (ASSETS)</h4>
          </div>
          
          <div className="glass-card bg-white border-2 border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-100">
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Akun</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((a, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800 text-lg leading-tight">{a.name}</p>
                      <p className="text-xs font-bold text-slate-400 font-mono mt-1">{a.code}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="font-black text-slate-900 text-xl">{fmt(a.amount)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-emerald-600 text-white">
                  <td className="px-8 py-6 font-black text-lg uppercase">Total Aktiva</td>
                  <td className="px-8 py-6 text-right font-black text-2xl">{fmt(totalAssets)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* LIABILITIES & EQUITY */}
        <div className="space-y-8">
          {/* LIABILITIES */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-4">
               <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                  <Building size={20} />
               </div>
               <h4 className="text-xl font-black text-slate-800">KEWAJIBAN (LIABILITIES)</h4>
            </div>
            
            <div className="glass-card bg-white border-2 border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {liabilities.map((l, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-black text-slate-800 text-lg leading-tight">{l.name}</p>
                        <p className="text-xs font-bold text-slate-400 font-mono mt-1">{l.code}</p>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <p className="font-black text-slate-900 text-xl">{fmt(l.amount)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-800 text-white">
                  <tr>
                    <td className="px-8 py-5 font-black text-sm uppercase">Total Kewajiban</td>
                    <td className="px-8 py-5 text-right font-black text-xl">{fmt(totalLiabilities)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* EQUITY */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-4">
               <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <CreditCard size={20} />
               </div>
               <h4 className="text-xl font-black text-slate-800">MODAL (EQUITY)</h4>
            </div>
            
            <div className="glass-card bg-white border-2 border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {equity.map((e, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-black text-slate-800 text-lg leading-tight">{e.name}</p>
                        <p className="text-xs font-bold text-slate-400 font-mono mt-1">{e.code}</p>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <p className="font-black text-slate-900 text-xl">{fmt(e.amount)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-800 text-white border-t border-slate-700">
                  <tr>
                    <td className="px-8 py-5 font-black text-sm uppercase">Total Ekuitas</td>
                    <td className="px-8 py-5 text-right font-black text-xl">{fmt(totalEquity)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* BOTTOM TOTAL SUMMARY */}
          <div className="glass-card p-8 bg-gradient-to-br from-indigo-700 to-indigo-900 text-white border-none shadow-2xl">
             <div className="flex justify-between items-center">
                <p className="text-lg font-bold opacity-70 uppercase tracking-widest">Total Pasiva (Liab + Equity)</p>
                <div className="text-right">
                   <h2 className="text-4xl font-black">{fmt(totalLiabilities + totalEquity)}</h2>
                   {Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1 ? (
                     <p className="text-emerald-400 text-xs font-black mt-1 flex items-center justify-end gap-1 uppercase">
                       <CheckCircle size={14} /> Balanced
                     </p>
                   ) : (
                     <p className="text-red-400 text-xs font-black mt-1 flex items-center justify-end gap-1 uppercase">
                       <AlertCircle size={14} /> Unbalanced
                     </p>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircle({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function AlertCircle({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}

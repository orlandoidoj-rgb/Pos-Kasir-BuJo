import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Minus, 
  Calendar, 
  ArrowRight,
  User,
  CreditCard,
  TrendingUp,
  History
} from 'lucide-react';
import { getTransactions } from '../../lib/storage';

const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export default function EquityStatement() {
  const [period, setPeriod] = useState('2026-03');
  
  const allTx = useMemo(() => getTransactions(), []);
  
  const netIncome = useMemo(() => {
    const filtered = allTx.filter(tx => tx.date.startsWith(period));
    const revenue = filtered.reduce((s, t) => s + t.total, 0);
    const cogs    = filtered.reduce((s, t) => s + t.totalCOGS, 0);
    return revenue - cogs;
  }, [allTx, period]);

  const beginningEquity = 150000000; // Fixed starting capital for demo
  const prive = 2500000; // Simulated drawings
  const endingEquity = beginningEquity + netIncome - prive;

  return (
    <div className="space-y-8 pb-20">
      {/* Period Selector (Duplicate for consistency, or extract to shared component) */}
      <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-xl leading-none">Laporan Perubahan Modal</h3>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Equity Statement Report</p>
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
           </select>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="glass-card bg-white border-2 border-slate-100 overflow-hidden shadow-xl">
          <div className="px-8 py-6 bg-slate-50 border-b-2 border-slate-100 flex justify-between items-center">
            <h4 className="font-black text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
               <History size={16} /> Rincian Transaksi Modal
            </h4>
            <span className="text-xs font-bold text-slate-400 font-mono">Periode: {period}</span>
          </div>

          <div className="p-10 space-y-8">
            {/* Step 1: Beginning Equity */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-800">Modal Awal</p>
                  <p className="text-sm font-bold text-slate-400 leading-none mt-1">Saldo per {new Date(period).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} 01</p>
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{fmt(beginningEquity)}</p>
            </div>

            <div className="h-px bg-slate-100"></div>

            {/* Step 2: Increases (Net Income) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Plus size={24} />
                </div>
                <div>
                  <p className="text-lg font-black text-emerald-700">Laba Bersih (Penjualan)</p>
                  <p className="text-sm font-bold text-slate-400 leading-none mt-1">Berdasarkan ringkasan Sales Log</p>
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-600">+{fmt(netIncome)}</p>
            </div>

            {/* Step 3: Decreases (Drawings / Prive) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                  <Minus size={24} />
                </div>
                <div>
                  <p className="text-lg font-black text-red-700">Prive (Pengambilan Pribadi)</p>
                  <p className="text-sm font-bold text-slate-400 leading-none mt-1">Biaya diluar operasional warung</p>
                </div>
              </div>
              <p className="text-2xl font-black text-red-600">-{fmt(prive)}</p>
            </div>

            <div className="h-0.5 bg-slate-800 mt-10 rounded-full"></div>

            {/* Step 4: Ending Equity */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-indigo-700 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-indigo-200">
                  <CreditCard size={32} />
                </div>
                <div>
                  <p className="text-2xl font-black text-indigo-900 leading-none">Modal Akhir</p>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2 leading-none">Total Equity per {new Date(period).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} 31</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-5xl font-black text-indigo-700 leading-none">{fmt(endingEquity)}</h2>
                <p className="text-sm font-black text-emerald-500 mt-2 flex items-center justify-end gap-1">
                   {((endingEquity - beginningEquity) / beginningEquity * 100).toFixed(1)}% Penambahan Modal
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 p-6 flex items-center justify-center gap-4 group cursor-pointer hover:bg-slate-800 transition-all">
             <span className="text-white text-sm font-black uppercase tracking-[0.2em]">Cetak Laporan Lengkap</span>
             <ArrowRight size={18} className="text-white group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}

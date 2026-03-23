import { useState, useMemo } from 'react';
import { TrendingUp, BookOpen, ArrowUpRight, Download, CheckCircle, XCircle, ShoppingCart, ChevronDown, ChevronRight, LayoutGrid, Receipt, Wallet } from 'lucide-react';
import Accounts from './finance/Accounts';
import SalesLog from './finance/SalesLog';
import BalanceSheet from './finance/BalanceSheet';
import EquityStatement from './finance/EquityStatement';
import { getTransactions, ORDER_TYPE_META, ORDER_TYPES, getBranches } from '../lib/storage';
import type { POSTransaction, OrderType } from '../lib/storage';

// ─── P&L Static Data ──────────────────────────────────────────────────────────

interface PLItem {
  label: string;
  amount: number;
  indent?: boolean;
  isSub?: boolean;
  isHeader?: boolean;
  isGrandTotal?: boolean;
  positive?: boolean;
}

const plData: PLItem[] = [
  { label: 'PENDAPATAN', amount: 0, isHeader: true },
  { label: 'Penjualan Kotor', amount: 12800000, indent: true },
  { label: 'Diskon & Retur', amount: -450000, indent: true },
  { label: 'Total Pendapatan Bersih', amount: 12350000, isSub: true, positive: true },

  { label: 'HARGA POKOK PENJUALAN (HPP)', amount: 0, isHeader: true },
  { label: 'Beban Bahan Baku', amount: -5200000, indent: true },
  { label: 'Total HPP', amount: -5200000, isSub: true },

  { label: 'LABA KOTOR', amount: 7150000, isSub: true, positive: true },

  { label: 'BIAYA OPERASIONAL', amount: 0, isHeader: true },
  { label: 'Gaji Karyawan', amount: -2500000, indent: true },
  { label: 'Sewa Tempat', amount: -1000000, indent: true },
  { label: 'Listrik & Air', amount: -350000, indent: true },
  { label: 'Biaya Operasional Lain', amount: -200000, indent: true },
  { label: 'Total Biaya Operasional', amount: -4050000, isSub: true },

  { label: 'LABA BERSIH', amount: 3100000, isGrandTotal: true, positive: true },
];

// ─── Journal Static Data ──────────────────────────────────────────────────────

interface JournalEntry {
  id: string;
  tanggal: string;
  noJurnal: string;
  keterangan: string;
  akun: string;
  kodeAkun: string;
  debet: number;
  kredit: number;
}

const journalEntries: JournalEntry[] = [
  { id: '1', tanggal: '2026-03-19', noJurnal: 'JU-001', keterangan: 'Penjualan POS - Ayam Goreng', akun: 'Kas', kodeAkun: '1101', debet: 45000, kredit: 0 },
  { id: '2', tanggal: '2026-03-19', noJurnal: 'JU-001', keterangan: 'Penjualan POS - Ayam Goreng', akun: 'Pendapatan Penjualan', kodeAkun: '4101', debet: 0, kredit: 45000 },
  { id: '3', tanggal: '2026-03-19', noJurnal: 'JU-002', keterangan: 'HPP - Ayam Goreng (BOM)', akun: 'HPP / Beban Pokok', kodeAkun: '5101', debet: 11750, kredit: 0 },
  { id: '4', tanggal: '2026-03-19', noJurnal: 'JU-002', keterangan: 'HPP - Ayam Goreng (BOM)', akun: 'Persediaan Bahan Baku', kodeAkun: '1401', debet: 0, kredit: 11750 },
  { id: '5', tanggal: '2026-03-18', noJurnal: 'JU-003', keterangan: 'Pembelian Beras Pandan 20Kg', akun: 'Persediaan Bahan Baku', kodeAkun: '1401', debet: 240000, kredit: 0 },
  { id: '6', tanggal: '2026-03-18', noJurnal: 'JU-003', keterangan: 'Pembelian Beras Pandan 20Kg', akun: 'Kas', kodeAkun: '1101', debet: 0, kredit: 240000 },
  { id: '7', tanggal: '2026-03-17', noJurnal: 'JU-004', keterangan: 'Pembayaran Gaji Maret', akun: 'Beban Gaji', kodeAkun: '6101', debet: 2500000, kredit: 0 },
  { id: '8', tanggal: '2026-03-17', noJurnal: 'JU-004', keterangan: 'Pembayaran Gaji Maret', akun: 'Kas', kodeAkun: '1101', debet: 0, kredit: 2500000 },
];

// ─── Shared Components ────────────────────────────────────────────────────────

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        active
          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
          : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
      }`}
    >
      {children}
    </button>
  );
}

function PLRow({ item }: { item: PLItem }) {
  if (item.isHeader) {
    return (
      <tr>
        <td colSpan={2} className="px-6 pt-5 pb-1">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
        </td>
      </tr>
    );
  }
  if (item.isGrandTotal) {
    return (
      <tr className="bg-indigo-600">
        <td className="px-6 py-4 text-sm font-black text-white uppercase tracking-wide">{item.label}</td>
        <td className={`px-6 py-4 text-lg font-black text-right ${item.positive ? 'text-white' : 'text-red-200'}`}>
          Rp {item.amount.toLocaleString('id-ID')}
          <span className="ml-2 text-sm font-semibold text-indigo-200">· 25.1% margin</span>
        </td>
      </tr>
    );
  }
  if (item.isSub) {
    return (
      <tr className="bg-slate-50 border-t border-slate-200">
        <td className="px-6 py-3 text-sm font-bold text-slate-700">{item.label}</td>
        <td className={`px-6 py-3 text-sm font-black text-right ${
          item.amount < 0 ? 'text-red-600' : item.positive ? 'text-emerald-600' : 'text-slate-700'
        }`}>
          {item.amount < 0 ? '(' : ''}Rp {Math.abs(item.amount).toLocaleString('id-ID')}{item.amount < 0 ? ')' : ''}
        </td>
      </tr>
    );
  }
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-2.5 text-sm text-slate-600 pl-12">{item.label}</td>
      <td className={`px-6 py-2.5 text-sm text-right ${item.amount < 0 ? 'text-red-500' : 'text-slate-700'}`}>
        {item.amount < 0 ? '(' : ''}Rp {Math.abs(item.amount).toLocaleString('id-ID')}{item.amount < 0 ? ')' : ''}
      </td>
    </tr>
  );
}

// ─── Penjualan Tab ────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

function SalesTab() {
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<OrderType | 'Semua'>('Semua');
  const [filterBranch, setFilterBranch] = useState<string>('Semua');

  const allTx = useMemo(() => getTransactions(), []);
  const branches = useMemo(() => getBranches(), []);

  const filtered = useMemo(() => {
    let txs = allTx;
    if (filterType !== 'Semua') txs = txs.filter((t: POSTransaction) => t.orderType === filterType);
    if (filterBranch !== 'Semua') txs = txs.filter((t: POSTransaction) => t.branchId === filterBranch);
    return txs;
  }, [allTx, filterType, filterBranch]);

  // Aggregate totals
  const totals = useMemo(() => {
    const revenue = filtered.reduce((s: number, t: POSTransaction) => s + t.total, 0);
    const cogs    = filtered.reduce((s: number, t: POSTransaction) => s + t.totalCOGS, 0);
    const gross   = filtered.reduce((s: number, t: POSTransaction) => s + t.grossProfit, 0);
    const tax     = filtered.reduce((s: number, t: POSTransaction) => s + t.tax, 0);
    const discount= filtered.reduce((s: number, t: POSTransaction) => s + t.discount, 0);
    return { revenue, cogs, gross, tax, discount, count: filtered.length };
  }, [filtered]);

  // Per-channel breakdown
  const byChannel = useMemo(() => {
    return ORDER_TYPES.map(ot => {
      const txs = allTx.filter((t: POSTransaction) => t.orderType === ot);
      return {
        type: ot,
        count: txs.length,
        revenue: txs.reduce((s: number, t: POSTransaction) => s + t.total, 0),
        cogs: txs.reduce((s: number, t: POSTransaction) => s + t.totalCOGS, 0),
        gross: txs.reduce((s: number, t: POSTransaction) => s + t.grossProfit, 0),
      };
    }).filter(c => c.count > 0);
  }, [allTx]);

  // Per-branch summary
  const byBranch = useMemo(() => {
    const map: Record<string, { nama: string; revenue: number; gross: number; count: number }> = {};
    allTx.forEach((tx: POSTransaction) => {
      const bId = tx.branchId || 'unknown';
      const bName = tx.branchName || branches.find((b: any) => b.id === bId)?.nama || bId;
      if (!map[bId]) map[bId] = { nama: bName, revenue: 0, gross: 0, count: 0 };
      map[bId].revenue += tx.total;
      map[bId].gross += tx.grossProfit;
      map[bId].count += 1;
    });
    return Object.entries(map).map(([id, v]) => ({ id, ...v }));
  }, [allTx, branches]);

  const marginPct = totals.revenue > 0
    ? ((totals.gross / totals.revenue) * 100).toFixed(1)
    : '0.0';

  if (allTx.length === 0) {
    return (
      <div className="glass-card p-16 text-center">
        <ShoppingCart size={40} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 font-semibold">Belum ada transaksi POS</p>
        <p className="text-xs text-slate-400 mt-1">Data akan muncul setelah kasir melakukan checkout di aplikasi POS</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Pendapatan</p>
          <p className="text-xl font-black text-slate-800">{fmt(totals.revenue)}</p>
          <p className="text-xs text-slate-400 mt-1">{totals.count} transaksi</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total HPP (COGS)</p>
          <p className="text-xl font-black text-slate-800">{fmt(totals.cogs)}</p>
          <p className="text-xs text-slate-400 mt-1">
            {totals.revenue > 0 ? ((totals.cogs / totals.revenue) * 100).toFixed(1) : '0'}% dari pendapatan
          </p>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-indigo-500">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Laba Kotor</p>
          <p className="text-xl font-black text-indigo-700">{fmt(totals.gross)}</p>
          <p className="text-xs text-indigo-400 font-semibold mt-1">{marginPct}% gross margin</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-sky-500">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pajak Terkumpul</p>
          <p className="text-xl font-black text-slate-800">{fmt(totals.tax)}</p>
          <p className="text-xs text-slate-400 mt-1">Diskon: {fmt(totals.discount)}</p>
        </div>
      </div>

      {/* Per-Branch Summary */}
      {byBranch.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Breakdown per Cabang</h3>
            <p className="text-xs text-slate-500 mt-0.5">Revenue dan laba kotor berdasarkan cabang</p>
          </div>
          <div className="divide-y divide-slate-100">
            {byBranch.map(b => {
              const margin = b.revenue > 0 ? ((b.gross / b.revenue) * 100).toFixed(1) : '0.0';
              return (
                <div key={b.id} className="px-6 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-slate-800">{b.nama}</span>
                    <span className="ml-2 text-xs text-slate-400">{b.count} tx</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{fmt(b.revenue)}</p>
                    <p className="text-xs text-emerald-600 font-semibold">{fmt(b.gross)} laba · {margin}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-Channel Breakdown */}
      {byChannel.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Breakdown per Channel</h3>
            <p className="text-xs text-slate-500 mt-0.5">Performa penjualan berdasarkan tipe transaksi</p>
          </div>
          <div className="divide-y divide-slate-100">
            {byChannel.map(ch => {
              const meta = ORDER_TYPE_META[ch.type];
              const margin = ch.revenue > 0 ? ((ch.gross / ch.revenue) * 100).toFixed(1) : '0.0';
              const share  = totals.revenue > 0 ? ((ch.revenue / totals.revenue) * 100).toFixed(1) : '0.0';
              return (
                <div key={ch.type} className="px-6 py-4 flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${meta.bg} ${meta.textColor} shrink-0`}>
                    {meta.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-bold text-slate-800">{fmt(ch.revenue)}</span>
                      <span className="text-xs text-slate-400">({share}% total)</span>
                      <span className="text-xs text-slate-400">· {ch.count} tx</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${meta.bg}`}
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-600">{fmt(ch.gross)}</p>
                    <p className="text-xs text-slate-400">{margin}% margin</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-slate-800">Riwayat Transaksi POS</h3>
            <p className="text-xs text-slate-500 mt-0.5">Data real dari aplikasi kasir · {filtered.length} transaksi</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {/* Branch filter */}
            <select
              value={filterBranch}
              onChange={e => setFilterBranch(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 outline-none focus:border-indigo-400 bg-white"
            >
              <option value="Semua">Semua Cabang</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.nama}</option>
              ))}
            </select>
            {/* Order type filter pills */}
            <button
              onClick={() => setFilterType('Semua')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'Semua'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              Semua
            </button>
            {ORDER_TYPES.map(ot => {
              const meta = ORDER_TYPE_META[ot];
              const active = filterType === ot;
              return (
                <button
                  key={ot}
                  onClick={() => setFilterType(ot)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    active ? `${meta.bg} ${meta.textColor}` : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['', 'ID Transaksi', 'Waktu', 'Cabang', 'Channel', 'Items', 'Subtotal', 'Diskon', 'Total', 'HPP', 'Laba Kotor'].map(h => (
                  <th key={h} className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(tx => {
                const meta = ORDER_TYPE_META[tx.orderType];
                const isExpanded = expandedTx === tx.id;
                const date = new Date(tx.date);
                const dateStr = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                const marginPctTx = tx.total > 0 ? ((tx.grossProfit / tx.total) * 100).toFixed(0) : '0';
                return (
                  <>
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${isExpanded ? 'bg-indigo-50/40' : ''}`}
                      onClick={() => setExpandedTx(isExpanded ? null : tx.id)}
                    >
                      <td className="px-4 py-3 text-slate-400">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-indigo-600 font-bold">{tx.id}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                        <span className="block">{dateStr}</span>
                        <span className="text-slate-400">{timeStr}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {tx.branchName || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${meta.bg} ${meta.textColor}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {tx.items.length} item
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{fmt(tx.subtotal)}</td>
                      <td className="px-4 py-3 text-sm text-red-500">
                        {tx.discount > 0 ? `(${fmt(tx.discount)})` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-800">{fmt(tx.total)}</td>
                      <td className="px-4 py-3 text-sm text-amber-600">{fmt(tx.totalCOGS)}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-emerald-600">{fmt(tx.grossProfit)}</span>
                        <span className="ml-1 text-xs text-emerald-400">({marginPctTx}%)</span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${tx.id}-detail`} className="bg-indigo-50/30">
                        <td colSpan={11} className="px-8 py-4">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detail Item</p>
                          <div className="space-y-1.5">
                            {tx.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-3 text-sm">
                                <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                                  {item.qty}x
                                </span>
                                <span className="flex-1 text-slate-700 font-medium">{item.productName}</span>
                                <span className="text-slate-500">{fmt(item.price)}/unit</span>
                                <span className="text-slate-400 text-xs">HPP: {fmt(item.hpp)}</span>
                                <span className="font-bold text-slate-800 w-28 text-right">{fmt(item.subtotal)}</span>
                              </div>
                            ))}
                          </div>
                          {tx.tax > 0 && (
                            <div className="mt-3 pt-3 border-t border-indigo-100 flex justify-end gap-8 text-xs text-slate-500">
                              <span>Pajak (PPN): {fmt(tx.tax)}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
            {/* Footer totals */}
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td colSpan={6} className="px-4 py-3 text-sm font-bold text-slate-600 text-right">TOTAL ({filtered.length} tx)</td>
                <td className="px-4 py-3 text-sm font-black text-slate-700">{fmt(filtered.reduce((s,t)=>s+t.subtotal,0))}</td>
                <td className="px-4 py-3 text-sm font-black text-red-500">
                  {totals.discount > 0 ? `(${fmt(totals.discount)})` : '—'}
                </td>
                <td className="px-4 py-3 text-sm font-black text-slate-800">{fmt(totals.revenue)}</td>
                <td className="px-4 py-3 text-sm font-black text-amber-600">{fmt(totals.cogs)}</td>
                <td className="px-4 py-3 text-sm font-black text-emerald-600">{fmt(totals.gross)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Finance Page ────────────────────────────────────────────────────────

export default function Finance() {
  const [tab, setTab] = useState<'pl' | 'jurnal' | 'penjualan' | 'akun' | 'log' | 'neraca' | 'equity'>('penjualan');

  const totalDebet  = journalEntries.reduce((s, e) => s + e.debet, 0);
  const totalKredit = journalEntries.reduce((s, e) => s + e.kredit, 0);
  const isBalanced  = totalDebet === totalKredit;

  return (
    <div className="space-y-5">
      {/* Tabs + Export */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <TabBtn active={tab === 'penjualan'} onClick={() => setTab('penjualan')}>
            <ShoppingCart size={15} /> Ringkasan
          </TabBtn>
          <TabBtn active={tab === 'log'} onClick={() => setTab('log')}>
            <Receipt size={15} /> Log Transaksi
          </TabBtn>
          <TabBtn active={tab === 'neraca'} onClick={() => setTab('neraca')}>
            <Wallet size={15} /> Neraca
          </TabBtn>
          <TabBtn active={tab === 'equity'} onClick={() => setTab('equity')}>
            <TrendingUp size={15} /> Perubahan Modal
          </TabBtn>
          <TabBtn active={tab === 'pl'} onClick={() => setTab('pl')}>
            <ArrowUpRight size={15} /> Laba Rugi
          </TabBtn>
          <TabBtn active={tab === 'jurnal'} onClick={() => setTab('jurnal')}>
            <BookOpen size={15} /> Jurnal Umum
          </TabBtn>
          <TabBtn active={tab === 'akun'} onClick={() => setTab('akun')}>
            <LayoutGrid size={15} /> Daftar Akun (COA)
          </TabBtn>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl font-semibold text-sm border border-slate-200 hover:border-slate-300 transition-all">
          <Download size={15} className="text-slate-400" />
          Export Excel
        </button>
      </div>

      {/* Summary Cards (P&L context) — only shown on pl/jurnal tabs */}
      {(tab === 'pl' || tab === 'jurnal') && (
        <div className="grid grid-cols-3 gap-5">
          <div className="glass-card p-5 border-l-4 border-l-emerald-500">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pendapatan Bersih</p>
            <p className="text-2xl font-black text-slate-800">Rp 12,35M</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-semibold">
              <ArrowUpRight size={13} /> +8,2% vs bulan lalu
            </div>
          </div>
          <div className="glass-card p-5 border-l-4 border-l-amber-500">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total HPP</p>
            <p className="text-2xl font-black text-slate-800">Rp 5,2M</p>
            <p className="text-xs text-slate-400 mt-1">42,1% dari pendapatan</p>
          </div>
          <div className="glass-card p-5 border-l-4 border-l-indigo-500">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Laba Bersih</p>
            <p className="text-2xl font-black text-indigo-700">Rp 3,1M</p>
            <p className="text-xs text-indigo-400 font-semibold mt-1">25,1% net margin</p>
          </div>
        </div>
      )}

      {/* ====== LAPORAN PENJUALAN (real data) ====== */}
      {tab === 'penjualan' && <SalesTab />}

      {/* ====== LABA RUGI ====== */}
      {tab === 'pl' && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800">Laporan Laba Rugi</h3>
              <p className="text-xs text-slate-500 mt-0.5">Periode: Maret 2026 · SAK-EMKM</p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-full">
              Sementara
            </span>
          </div>
          <table className="w-full">
            <tbody>
              {plData.map((item, i) => <PLRow key={i} item={item} />)}
            </tbody>
          </table>
        </div>
      )}

      {/* ====== JURNAL UMUM ====== */}
      {tab === 'jurnal' && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800">Jurnal Umum — Double Entry</h3>
              <p className="text-xs text-slate-500 mt-0.5">Setiap transaksi POS dicatat otomatis</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${
              isBalanced
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {isBalanced
                ? <><CheckCircle size={15} /> Balanced</>
                : <><XCircle size={15} /> Unbalanced</>
              }
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Tanggal', 'No. Jurnal', 'Keterangan', 'Akun', 'Kode', 'Debet', 'Kredit'].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journalEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-500">{entry.tanggal}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold rounded-md">
                        {entry.noJurnal}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{entry.keterangan}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">{entry.akun}</td>
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-400">{entry.kodeAkun}</td>
                    <td className="px-5 py-3.5 text-sm text-right font-bold text-emerald-700">
                      {entry.debet > 0 ? `Rp ${entry.debet.toLocaleString('id-ID')}` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right font-bold text-slate-600">
                      {entry.kredit > 0 ? `Rp ${entry.kredit.toLocaleString('id-ID')}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                <tr>
                  <td colSpan={5} className="px-5 py-3 text-sm font-bold text-slate-600 text-right">TOTAL</td>
                  <td className="px-5 py-3 text-sm font-black text-right text-emerald-700">
                    Rp {totalDebet.toLocaleString('id-ID')}
                  </td>
                  <td className="px-5 py-3 text-sm font-black text-right text-slate-700">
                    Rp {totalKredit.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ====== DAFTAR AKUN (COA) ====== */}
      {tab === 'akun' && <Accounts />}

      {/* ====== NERACA ====== */}
      {tab === 'neraca' && <BalanceSheet />}

      {/* ====== PERUBAHAN MODAL ====== */}
      {tab === 'equity' && <EquityStatement />}

      {/* ====== LOG TRANSAKSI ====== */}
      {tab === 'log' && <SalesLog />}
    </div>
  );
}

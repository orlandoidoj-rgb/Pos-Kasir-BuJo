import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Search, 
  Receipt, 
  Store, 
  User, 
  TrendingUp, 
  ShoppingBag, 
  Clock,
  X,
  CreditCard,
  Banknote,
  QrCode,
  Eye,
  Printer
} from 'lucide-react';
import { MOCK_TRANSACTIONS, type MockTransaction } from '../../data/mock-transactions';
import { motion, AnimatePresence } from 'framer-motion';

const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export default function SalesLog() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState('');
  
  // State for Modal
  const [selectedTransaction, setSelectedTransaction] = useState<MockTransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTx = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(tx => {
      const matchDate = tx.date.startsWith(selectedDate);
      const matchSearch = tx.id.toLowerCase().includes(search.toLowerCase()) || 
                          tx.branchName.toLowerCase().includes(search.toLowerCase()) ||
                          tx.cashierName.toLowerCase().includes(search.toLowerCase());
      return matchDate && matchSearch;
    });
  }, [selectedDate, search]);

  const stats = useMemo(() => {
    const totalRevenue = filteredTx.reduce((s, t) => s + t.grandTotal, 0);
    const count = filteredTx.length;
    const avg = count > 0 ? Math.round(totalRevenue / count) : 0;
    return { totalRevenue, count, avg };
  }, [filteredTx]);

  const handleOpenDetail = (tx: MockTransaction) => {
    setSelectedTransaction(tx);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Bento Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        <div className="glass-card p-8 bg-gradient-to-br from-primary to-primary-dark text-white border-none shadow-xl shadow-primary/20">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <ShoppingBag size={28} />
            </div>
          </div>
          <p className="text-lg font-bold opacity-80 mb-1 leading-none">Total Revenue</p>
          <h2 className="text-4xl font-black">{fmt(stats.totalRevenue)}</h2>
        </div>

        <div className="glass-card p-8 bg-white border-2 border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
              <Receipt size={28} />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-400 mb-1 leading-none">Transactions</p>
          <h2 className="text-4xl font-black text-slate-800">{stats.count} <span className="text-xl font-bold opacity-30 italic px-1">TX</span></h2>
        </div>

        <div className="glass-card p-8 bg-white border-2 border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
              <TrendingUp size={28} />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-400 mb-1 leading-none">Average Ticket</p>
          <h2 className="text-4xl font-black text-slate-800">{fmt(stats.avg)}</h2>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm font-sans">
        <div className="flex items-center gap-3">
          <button onClick={handlePrevDay} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 transition-all">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl min-w-[240px] justify-center">
            <Calendar size={20} className="text-primary" />
            <span className="text-xl font-black text-slate-800 tracking-tight">
              {new Date(selectedDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <button onClick={handleNextDay} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 transition-all">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="flex-1 w-full lg:max-w-md relative">
          <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari ID, Cabang, atau Kasir..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg outline-none focus:ring-4 focus:ring-primary/10 transition-all font-semibold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="glass-card bg-white border-2 border-slate-100 overflow-hidden shadow-sm font-sans">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Invoice</th>
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Waktu</th>
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Cabang</th>
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Kasir</th>
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Total</th>
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredTx.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center">
                   <div className="flex flex-col items-center gap-3 opacity-20">
                      <Receipt size={64} />
                      <p className="text-xl font-black uppercase">Belum ada transaksi</p>
                   </div>
                </td>
              </tr>
            ) : (
              filteredTx.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-mono font-black text-slate-900 leading-none">{tx.id}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                       <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                         tx.paymentMethod === 'QRIS' ? 'bg-indigo-100 text-indigo-700' : 
                         tx.paymentMethod === 'CASH' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                       }`}>
                         {tx.paymentMethod}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 font-bold text-slate-600">
                      <Clock size={16} className="text-slate-300" />
                      {new Date(tx.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <Store size={18} className="text-slate-400" />
                       <span className="font-black text-slate-800">{tx.branchName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-600 font-bold">{tx.cashierName}</td>
                  <td className="px-8 py-6">
                    <span className="font-black text-lg text-slate-900">{fmt(tx.grandTotal)}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => handleOpenDetail(tx)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-xl transition-all font-black text-xs uppercase tracking-wider"
                    >
                      <Eye size={16} /> Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal (Executive Style) */}
      <AnimatePresence>
        {isModalOpen && selectedTransaction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             {/* Backdrop Blur */}
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={handleCloseModal}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             />

             {/* Modal Content */}
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 30 }} 
               animate={{ scale: 1, opacity: 1, y: 0 }} 
               exit={{ scale: 0.9, opacity: 0, y: 30 }}
               className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden font-sans border border-white"
             >
                <div className="flex flex-col max-h-[90vh]">
                   {/* Header Modal */}
                   <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                      <div className="flex justify-between items-start mb-6">
                         <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                            <Receipt size={24} />
                         </div>
                         <button 
                           onClick={handleCloseModal}
                           className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400"
                         >
                            <X size={24} />
                         </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-4">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Invoice ID</p>
                            <h4 className="text-xl font-black text-slate-900 leading-none">{selectedTransaction.id}</h4>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Cabang</p>
                            <h4 className="text-lg font-black text-slate-800 leading-none">{selectedTransaction.branchName}</h4>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Kasir</p>
                            <div className="flex items-center gap-1.5 font-bold text-slate-600">
                               <User size={14} className="text-primary" /> {selectedTransaction.cashierName}
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Tanggal & Jam</p>
                            <div className="inline-flex items-center gap-1.5 font-bold text-slate-600">
                               <Clock size={14} className="text-primary" /> {new Date(selectedTransaction.date).toLocaleString('id-ID')}
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Body Modal (Item List) */}
                   <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">Rincian Pembelian</p>
                      <div className="space-y-4">
                         {selectedTransaction.items.map((item: any, i: number) => (
                           <div key={i} className="flex justify-between items-start group">
                              <div className="flex-1 pr-10">
                                 <p className="text-base font-black text-slate-800 leading-none mb-1 group-hover:text-primary transition-colors">{item.name}</p>
                                 <p className="text-xs font-bold text-slate-400">{item.qty} x {fmt(item.price)}</p>
                              </div>
                              <p className="text-base font-black text-slate-900">{fmt(item.subtotal)}</p>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Footer Modal (Summary & Payment) */}
                   <div className="p-8 bg-slate-50/80 border-t border-slate-100 flex flex-col gap-6">
                      <div className="space-y-3">
                         <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                            <span>Subtotal</span>
                            <span>{fmt(selectedTransaction.items.reduce((s: number, i: any) => s + i.subtotal, 0))}</span>
                         </div>
                         {selectedTransaction.discount > 0 && (
                           <div className="flex justify-between items-center text-sm font-bold text-rose-500">
                              <span>Diskon / Voucher</span>
                              <span>−{fmt(selectedTransaction.discount)}</span>
                           </div>
                         )}
                         <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                            <div>
                               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Grand Total</p>
                               <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                 selectedTransaction.paymentMethod === 'QRIS' ? 'bg-indigo-600 text-white' : 
                                 selectedTransaction.paymentMethod === 'CASH' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                               }`}>
                                  {selectedTransaction.paymentMethod === 'QRIS' ? <QrCode size={12} /> : selectedTransaction.paymentMethod === 'CASH' ? <Banknote size={12} /> : <CreditCard size={12} />}
                                  {selectedTransaction.paymentMethod}
                               </div>
                            </div>
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">{fmt(selectedTransaction.grandTotal)}</span>
                         </div>
                      </div>

                      <div className="flex gap-4">
                         <button 
                           onClick={handleCloseModal}
                           className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                         >
                            Tutup
                         </button>
                         <button 
                           onClick={() => alert('Cetak Struk... (Dummy Function)')}
                           className="flex-1 py-4 bg-secondary text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-secondary/20"
                         >
                            <Printer size={18} /> Cetak Struk
                         </button>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

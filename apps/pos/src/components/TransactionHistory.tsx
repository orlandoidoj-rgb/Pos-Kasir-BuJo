import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Receipt, 
  Clock, 
  User, 
  ChevronRight, 
  ChevronLeft,
  Printer, 
  Download,
  Calendar,
  CreditCard,
  Wallet,
  Banknote,
  QrCode,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { printCustomerReceipt } from '../utils/print';

// Helper for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '--:--';
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const getPaymentIcon = (method: string) => {
  const m = method?.toLowerCase() || '';
  if (m.includes('cash') || m.includes('tunai')) return <Banknote className="w-4 h-4" />;
  if (m.includes('qris')) return <QrCode className="w-4 h-4" />;
  if (m.includes('debit') || m.includes('kartu')) return <CreditCard className="w-4 h-4" />;
  if (m.includes('wallet') || m.includes('pay')) return <Wallet className="w-4 h-4" />;
  return <Receipt className="w-4 h-4" />;
};

interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: any[];
  initialTransaction?: any;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  isOpen, 
  onClose, 
  transactions = [], 
  initialTransaction 
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (initialTransaction?.id) {
      setSelectedId(initialTransaction.id);
      setViewDate(new Date(initialTransaction.date || initialTransaction.timestamp).toISOString().slice(0, 10));
    } else if (transactions.length > 0 && !selectedId) {
      // Find first transaction for current viewDate if possible
      const todayTx = transactions.find(t => (t.date || t.timestamp).startsWith(viewDate));
      if (todayTx) setSelectedId(todayTx.id);
    }
  }, [initialTransaction, transactions, selectedId, viewDate]);

  const filteredTransactions = transactions.filter(t => 
    (t.date || t.timestamp).startsWith(viewDate)
  );

  const selectedTransaction = transactions.find(t => t.id === selectedId);

  const shiftDate = (days: number) => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + days);
    setViewDate(d.toISOString().slice(0, 10));
    setSelectedId(null);
  };

  const formatHeaderDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface w-full max-w-6xl h-[85vh] rounded-[2.5rem] shadow-2xl flex overflow-hidden border border-white/20"
      >
        {/* Left Sidebar: Transaction List */}
        <div className="w-80 border-r border-border flex flex-col bg-white">
          <div className="p-6 border-b border-border space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-headline font-black text-primary flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Riwayat
              </h2>
              <button 
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-surface-low rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center gap-2 bg-surface-low p-2 rounded-2xl border border-border">
              <button 
                onClick={() => shiftDate(-1)}
                className="p-2.5 hover:bg-white hover:text-primary rounded-xl transition-all shadow-sm bg-white/50"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex-1 relative group bg-white rounded-xl border border-border/50 hover:border-primary/30 transition-all shadow-sm overflow-hidden">
                <div className="flex items-center justify-center gap-2 px-3 py-2 cursor-pointer">
                  <Calendar size={14} className="text-primary opacity-60" />
                  <div className="text-[11px] font-black uppercase text-on-surface-muted truncate selection:bg-transparent">
                    {formatHeaderDate(viewDate)}
                  </div>
                </div>
                <input 
                  type="date"
                  value={viewDate}
                  onChange={(e) => { setViewDate(e.target.value); setSelectedId(null); }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>

              <button 
                onClick={() => shiftDate(1)}
                className="p-2.5 hover:bg-white hover:text-primary rounded-xl transition-all shadow-sm bg-white/50"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-muted" />
              <input 
                type="text" 
                placeholder="Cari transaksi..." 
                className="w-full pl-10 pr-4 py-2 bg-surface border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-body text-xs"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-surface-low/30">
            {filteredTransactions.map((tx) => (
              <button
                key={tx.id}
                onClick={() => setSelectedId(tx.id)}
                className={cn(
                  "w-full p-4 rounded-2xl text-left transition-all duration-200 flex flex-col group",
                  selectedId === tx.id 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-surface hover:bg-surface-high border border-transparent hover:border-border"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    selectedId === tx.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                  )}>
                    {formatDate(tx.date || tx.timestamp)}
                  </span>
                  <span className="text-xs font-mono opacity-60">#{tx.id.slice(-6)}</span>
                </div>
                <div className="text-base font-headline font-black truncate">
                  {formatCurrency(tx.total || tx.grandTotal)}
                </div>
                <div className={cn(
                   "text-[10px] font-bold opacity-60 mt-1 uppercase tracking-widest",
                   selectedId === tx.id ? "text-white/80" : "text-on-surface-muted"
                )}>
                  {tx.orderType || 'Transaksi'}
                </div>
              </button>
            ))}
            {filteredTransactions.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                <Receipt size={40} />
                <p className="text-xs font-black uppercase mt-2">Belum ada data</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Receipt Detail */}
        <div className="flex-1 flex flex-col bg-surface-low overflow-y-auto relative">
          <button 
             onClick={onClose}
             className="absolute top-6 right-6 p-3 bg-white hover:bg-rose-50 hover:text-rose-500 text-on-surface-muted rounded-2xl shadow-sm border border-border transition-all z-10"
          >
             <X size={24} />
          </button>

          {selectedTransaction ? (
            <div className="max-w-xl mx-auto w-full p-8 space-y-6">
              {/* Action Bar */}
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    printCustomerReceipt({
                        storeName: 'Warung BuJo',
                        branchName: selectedTransaction.branchName || 'Cabang',
                        txId: selectedTransaction.id,
                        date: new Date(selectedTransaction.date || selectedTransaction.timestamp),
                        cashierName: selectedTransaction.cashierName || 'Kasir',
                        orderType: selectedTransaction.orderType || 'Dine-in',
                        items: (selectedTransaction.items || []).map((i: any) => ({
                           name: i.productName || i.name,
                           qty: i.qty,
                           price: i.price,
                           subtotal: i.subtotal
                        })),
                        subtotal: selectedTransaction.subtotal,
                        discount: selectedTransaction.discount,
                        tax: selectedTransaction.tax,
                        total: selectedTransaction.total || selectedTransaction.grandTotal,
                        paymentMethod: selectedTransaction.paymentMethod || 'TUNAI',
                        amountPaid: selectedTransaction.total || selectedTransaction.grandTotal,
                        change: 0
                    });
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-all font-bold text-sm shadow-lg shadow-primary/20"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Struk
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-on-surface hover:bg-surface-high rounded-2xl transition-all font-bold text-sm border border-border shadow-sm">
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>

              {/* Receipt Content */}
              <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-border">
                <div className="h-2 bg-primary" />
                
                <div className="p-8 space-y-8">
                  {/* Header */}
                  <div className="text-center space-y-4">
                    <div className="inline-block p-4 bg-primary/5 rounded-[1.5rem] text-primary">
                      <Receipt className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-headline font-black text-on-surface">
                        {selectedTransaction.branchName || 'Warung BuJo'}
                      </h3>
                      <div className="flex items-center justify-center gap-4 mt-2 text-xs font-bold text-on-surface-muted uppercase tracking-widest">
                        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(selectedTransaction.date || selectedTransaction.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatDate(selectedTransaction.date || selectedTransaction.timestamp)}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs font-bold bg-surface p-2.5 rounded-xl border border-border/50">
                      <User className="w-3.5 h-3.5 text-primary" />
                      Kasir: {selectedTransaction.cashierName || '--'}
                    </div>
                  </div>

                  <div className="border-t border-dashed border-border" />

                  {/* Items Table */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 text-[10px] font-black text-on-surface-muted uppercase tracking-widest px-2">
                      <div className="col-span-6">Produk</div>
                      <div className="col-span-2 text-center">Qty</div>
                      <div className="col-span-4 text-right">Total</div>
                    </div>
                    <div className="space-y-4">
                      {(selectedTransaction.items || []).map((item: any, idx: number) => (
                        <div key={idx} className="grid grid-cols-12 items-center px-2">
                          <div className="col-span-6">
                            <div className="font-black text-on-surface text-sm leading-tight">{item.productName || item.name}</div>
                            <div className="text-[10px] font-bold text-on-surface-muted mt-0.5">@ {formatCurrency(item.price)}</div>
                          </div>
                          <div className="col-span-2 text-center font-black text-on-surface text-sm">
                            {item.qty}x
                          </div>
                          <div className="col-span-4 text-right font-black text-on-surface text-sm">
                            {formatCurrency(item.subtotal)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-6 space-y-3">
                    <div className="flex justify-between text-xs font-bold text-on-surface-muted uppercase tracking-widest"><span>Subtotal</span><span>{formatCurrency(selectedTransaction.subtotal)}</span></div>
                    {selectedTransaction.discount > 0 && (
                      <div className="flex justify-between text-xs font-bold text-emerald-600 uppercase tracking-widest"><span>Diskon</span><span>-{formatCurrency(selectedTransaction.discount)}</span></div>
                    )}
                    {selectedTransaction.tax > 0 && (
                      <div className="flex justify-between text-xs font-bold text-on-surface-muted uppercase tracking-widest"><span>Pajak</span><span>{formatCurrency(selectedTransaction.tax)}</span></div>
                    )}
                    <div className="flex justify-between items-end pt-4 border-t border-double border-border mt-2">
                      <span className="text-lg font-headline font-black text-on-surface">GRAND TOTAL</span>
                      <span className="text-3xl font-headline font-black text-primary tracking-tighter">
                        {formatCurrency(selectedTransaction.total || selectedTransaction.grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Footer / Payment Method */}
                  <div className="bg-surface rounded-3xl p-5 flex items-center justify-between border border-border">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm border border-border text-primary">
                        {getPaymentIcon(selectedTransaction.paymentMethod || '')}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-black text-on-surface-muted tracking-widest">Metode</div>
                        <div className="font-black text-on-surface uppercase text-xs">{selectedTransaction.paymentMethod || 'TUNAI'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-black text-on-surface-muted tracking-widest">Invoice</div>
                      <div className="font-mono text-xs font-black text-primary uppercase">#{selectedTransaction.id.slice(-8)}</div>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-on-surface-muted pt-4 uppercase tracking-[0.3em] font-black opacity-40">
                    *** Warung BuJo ***
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-on-surface-muted space-y-6">
              <div className="p-10 bg-white rounded-[2.5rem] shadow-inner border border-border flex items-center justify-center">
                <Receipt className="w-20 h-20 opacity-5" />
              </div>
              <p className="font-black uppercase text-xs tracking-widest opacity-40">Pilih transaksi untuk melihat detail</p>
            </div>
          )}
        </div>
      </motion.div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e3e9ed; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </motion.div>
  );
};

export default TransactionHistory;

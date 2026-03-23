import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { OrderSetup, PaymentMethod } from '../../types';
import { PAYMENT_CONFIGS, DEFAULT_PAYMENT } from '../../config';

interface PaymentViewProps {
  orderSetup: OrderSetup;
  total: number;
  setShowPayment: (val: boolean) => void;
  handleConfirmPayment: (method: PaymentMethod, paid: number) => void;
}

export default function PaymentView({
  orderSetup, total, setShowPayment, handleConfirmPayment
}: PaymentViewProps) {
  return (
    <motion.div 
      key="payment"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="flex flex-col h-full bg-gray-50/30"
    >
      <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
         <div>
            <h2 className="text-2xl font-black text-gray-900 leading-none mb-1">Pembayaran</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{orderSetup.orderType}</p>
         </div>
         <button onClick={() => setShowPayment(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all shadow-sm bg-white border border-gray-100">
           <ArrowLeft size={20} />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
         <div className="p-8 bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Total Tagihan</p>
            <p className="text-5xl font-black text-white font-headline tracking-tighter drop-shadow-lg">Rp {total.toLocaleString('id-ID')}</p>
         </div>

         <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Metode Pembayaran</p>
            <div className="grid grid-cols-2 gap-3">
               {PAYMENT_CONFIGS.filter(p => p.forTypes.includes(orderSetup.orderType)).map(m => {
                  const isActive = (DEFAULT_PAYMENT as any)[orderSetup.orderType] === m.method;
                  return (
                     <button
                        key={m.method}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3 ${
                           isActive ? 'border-primary bg-primary/5 text-primary' : 'border-gray-50 bg-white hover:border-gray-200 text-gray-400'
                        }`}
                     >
                        <div className={`p-4 rounded-2xl ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-50'}`}>
                          <m.icon size={24} />
                        </div>
                        <p className="font-black text-xs uppercase tracking-widest">{m.label}</p>
                     </button>
                  );
               })}
            </div>
         </div>
      </div>

      <div className="p-8 bg-white border-t border-gray-100">
         <button
            onClick={() => handleConfirmPayment('tunai', total)}
            className="w-full py-6 bg-primary hover:bg-primary-dark text-white font-headline font-black text-sm rounded-2xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all group relative overflow-hidden ring-1 ring-white/10"
         >
            <span className="relative z-10 tracking-[0.3em] uppercase">Konfirmasi Pembayaran</span>
         </button>
      </div>
    </motion.div>
  );
}

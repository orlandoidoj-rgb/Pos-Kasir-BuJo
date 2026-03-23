import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Printer } from 'lucide-react';
import { fmt } from '../../utils';

interface SuccessToastProps {
  data: {
    id: string;
    change: number;
    pointsEarned: number;
    customerName?: string;
  };
}

export default function SuccessToast({ data }: SuccessToastProps) {
  return (
    <motion.div 
      initial={{ opacity:0, y:40 }} 
      animate={{ opacity:1, y:0 }} 
      exit={{ opacity:0, y:40 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-8 py-5 bg-emerald-600 text-white rounded-[2rem] shadow-2xl font-bold text-base whitespace-nowrap"
    >
       <CheckCircle size={22} /> 
       Transaksi Berhasil! 
       <span className="font-mono opacity-60">#{data.id.slice(-6)}</span>
       {data.change > 0 && <span className="px-3 py-1 bg-white/20 rounded-full font-black">Kembali {fmt(data.change)}</span>}
       <button 
         onClick={() => window.print()}
         className="ml-2 flex items-center gap-2 px-3 py-2 bg-emerald-700/50 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
       >
         <Printer size={16} /> <span className="text-sm">Cetak Ulang</span>
       </button>
    </motion.div>
  );
}

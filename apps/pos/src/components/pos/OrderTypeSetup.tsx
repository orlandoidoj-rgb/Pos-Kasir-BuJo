import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { ORDER_TYPE_CONFIG } from '../../config';
import { OrderSetup } from '../../types';

interface OrderTypeSetupProps {
  orderSetup: OrderSetup;
  setOrderSetup: (setup: OrderSetup) => void;
  setScreen: (screen: 'login'|'setup'|'ordering') => void;
}

export default function OrderTypeSetup({ orderSetup, setOrderSetup, setScreen }: OrderTypeSetupProps) {
  return (
    <motion.div 
      key="setup"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-8 flex flex-col h-full bg-gray-50/50"
    >
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary mx-auto mb-4 scale-90">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 leading-tight mb-1">Pilih Tipe Pesanan</h2>
        <p className="text-gray-400 font-bold text-sm">Silakan tentukan bagaimana pelanggan akan menikmati hidangan kami.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 overflow-y-auto">
        {ORDER_TYPE_CONFIG.map(config => (
          <button 
            key={config.type}
            onClick={() => { 
                setOrderSetup({...orderSetup, orderType: config.type}); 
                setScreen('ordering'); 
            }}
            className={`flex items-center gap-6 p-6 rounded-2xl border-2 transition-all group ${
                orderSetup.orderType === config.type ? `border-primary bg-primary/5 text-primary` : 'border-white bg-white/50 hover:border-gray-200'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                orderSetup.orderType === config.type ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-gray-100 text-gray-400'
            }`}>
              <config.icon size={28} />
            </div>
            <div className="text-left">
                <p className="font-black text-xl leading-none mb-1">{config.label}</p>
                <p className="text-sm font-bold opacity-50">{config.sublabel}</p>
            </div>
            <ChevronRight className={`ml-auto transition-transform ${orderSetup.orderType === config.type ? 'translate-x-1' : 'opacity-0'}`} />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

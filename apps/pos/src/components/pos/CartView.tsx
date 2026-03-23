import React from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { CartItem, OrderSetup } from '../../types';
import { fmt } from '../../utils';
import CartItemRow from './CartItemRow';

interface CartViewProps {
  cart: CartItem[];
  orderSetup: OrderSetup;
  setScreen: (screen: 'setup'|'ordering') => void;
  setCart: (cart: CartItem[]) => void;
  updateQty: (id: string, delta: number) => void;
  subtotal: number;
  tax: number;
  total: number;
  setShowPayment: (val: boolean) => void;
}

export default function CartView({
  cart, orderSetup, setScreen, setCart, updateQty,
  subtotal, tax, total, setShowPayment
}: CartViewProps) {
  return (
    <motion.div 
      key="cart"
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="flex flex-col h-full"
    >
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md">
         <div>
            <h2 className="text-2xl font-black text-gray-900 leading-none mb-1">List Pesanan</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{orderSetup.customerName || 'Pelanggan Umum'}</p>
         </div>
         <button onClick={() => { setScreen('setup'); setCart([]); }} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-rose-500 transition-all"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-3">
         {cart.map((item: CartItem) => (
            <CartItemRow key={item.id} item={item} updateQty={updateQty} />
         ))}
         {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-10 py-20 grayscale">
               <ShoppingBag size={80} strokeWidth={1} />
               <p className="text-sm font-black uppercase mt-6 tracking-[0.3em]">Keranjang Kosong</p>
            </div>
         )}
      </div>

      <div className="p-5 bg-gradient-to-br from-gray-950 via-gray-900 to-black rounded-t-2xl shadow-[0_-15px_40px_-20px_rgba(0,0,0,0.8)] border-t border-white/10 relative overflow-hidden space-y-5">
         <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[2px]"></div>
         <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]"><span>Subtotal</span><span className="text-gray-300 font-headline">{fmt(subtotal)}</span></div>
            {tax > 0 && <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]"><span>Pajak (PPN)</span><span className="text-gray-300 font-headline">{fmt(tax)}</span></div>}
         </div>
         <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
         <div className="flex justify-between items-center relative z-10 py-1">
            <div className="space-y-0.5">
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Total Netto</p>
               <p className="text-[11px] font-semibold text-gray-500 uppercase">{cart.reduce((s,i) => s+i.qty, 0)} Produk</p>
            </div>
            <div className="text-right">
               <span className="text-4xl font-black text-white font-headline tracking-tighter">{fmt(total)}</span>
            </div>
         </div>
         <button 
            disabled={cart.length === 0}
            onClick={() => setShowPayment(true)}
            className="w-full py-5 bg-primary hover:bg-primary-dark text-white font-headline font-black text-sm rounded-xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed group relative overflow-hidden ring-1 ring-white/10"
         >
            <span className="relative z-10 tracking-[0.3em] uppercase">Selesaikan Transaksi</span>
         </button>
      </div>
    </motion.div>
  );
}

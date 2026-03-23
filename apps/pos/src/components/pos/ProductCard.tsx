import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { POSProduct } from '../../types';

interface ProductCardProps {
  product: POSProduct;
  orderType: string;
  cartQty?: number;
  onAdd: () => void;
  disabled: boolean;
}

export default function ProductCard({
  product,
  orderType,
  cartQty,
  onAdd,
  disabled
}: ProductCardProps) {
  const price = (product.allPrices as any)[orderType] ?? 0;

  return (
    <motion.button 
      onClick={onAdd}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -6 }}
      disabled={disabled}
      className="bg-white rounded-[2rem] p-3 text-left border-2 border-gray-200 shadow-xl transition-all group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="aspect-square w-full rounded-[1.5rem] overflow-hidden relative border border-gray-100/50">
        <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
        
        {/* Floating Text Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-12">
          <p className="text-white text-xl font-black font-headline leading-tight mb-2 drop-shadow-md">{product.name}</p>
          <div className="flex items-center justify-between">
            <p className="text-primary font-black text-2xl font-headline drop-shadow-lg shadow-primary/20">Rp {price.toLocaleString('id-ID')}</p>
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <Plus size={20} strokeWidth={3} />
            </div>
          </div>
        </div>

        {cartQty && cartQty > 0 ? (
          <motion.div 
            initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} 
            className="absolute top-4 right-4 w-11 h-11 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center font-black text-lg z-20 border-2 border-white/20"
          >
            {cartQty}
          </motion.div>
        ) : null}
      </div>
    </motion.button>
  );
}

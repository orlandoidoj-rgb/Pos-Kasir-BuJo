import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { formatRupiah } from '../../utils/format';
import { motion } from 'framer-motion';

interface BottomCartBarProps {
  itemCount: number;
  total: number;
  slug: string;
}

export const BottomCartBar: React.FC<BottomCartBarProps> = ({ itemCount, total, slug }) => {
  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 p-4 z-50 max-w-md mx-auto"
    >
      <Link 
        to={`/${slug}/cart`}
        className="bg-primary text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <ShoppingBag size={24} />
            <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-primary">
              {itemCount}
            </span>
          </div>
          <div>
            <p className="text-xs opacity-80 font-medium">Lihat Keranjang</p>
            <p className="font-bold text-lg leading-tight">{formatRupiah(total)}</p>
          </div>
        </div>
        <ChevronRight size={24} />
      </Link>
    </motion.div>
  );
};

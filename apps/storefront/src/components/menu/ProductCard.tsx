import React from 'react';
import { MenuItem } from '../../types/product';
import { formatRupiah } from '../../utils/format';
import { Plus, Minus } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProductCardProps {
  product: MenuItem;
  cartQty: number;
  onAdd: () => void;
  onRemove: () => void;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  cartQty, 
  onAdd, 
  onRemove,
  onClick 
}) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 flex flex-col gap-3 group active:scale-[0.98] transition-transform">
      <div 
        onClick={onClick}
        className="aspect-square w-full rounded-2xl bg-gray-100 overflow-hidden relative cursor-pointer"
      >
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-lg italic">
            BuJo
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-danger text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">HABIS</span>
          </div>
        )}
      </div>

      <div className="flex-1 px-1">
        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug h-10 mb-1">{product.name}</h3>
        <p className="text-primary font-black text-base">{formatRupiah(product.price)}</p>
      </div>

      <div className="px-1 pb-1">
        {cartQty > 0 ? (
          <div className="flex items-center justify-between bg-primary/5 rounded-xl p-1 translate-z-0">
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-1.5 text-primary hover:bg-white rounded-lg transition-colors"
            >
              <Minus size={18} strokeWidth={3} />
            </button>
            <span className="font-black text-primary text-sm">{cartQty}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="p-1.5 text-primary hover:bg-white rounded-lg transition-colors"
              disabled={cartQty >= product.stock}
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <Button 
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            disabled={isOutOfStock}
            variant={isOutOfStock ? "secondary" : "primary"}
            className="w-full py-2 text-xs font-black uppercase tracking-wider"
          >
            {isOutOfStock ? "HABIS" : "TAMBAH"}
          </Button>
        )}
      </div>
    </div>
  );
};

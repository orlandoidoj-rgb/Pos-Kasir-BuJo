import React from 'react';
import { CartItem as CartItemType } from '../../types/cart';
import { formatRupiah } from '../../utils/format';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
  onUpdateQty: (delta: number) => void;
  onRemove: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQty, onRemove }) => {
  return (
    <div className="flex items-start gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">BuJo</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-900 truncate pr-2">{item.name}</h3>
          <button onClick={onRemove} className="text-gray-400 hover:text-danger p-1">
            <Trash2 size={18} />
          </button>
        </div>
        
        {item.notes && (
          <p className="text-xs text-gray-500 italic mb-2 line-clamp-1">"{item.notes}"</p>
        )}
        
        <div className="flex items-center justify-between mt-auto">
          <p className="font-black text-primary text-sm">{formatRupiah(Number(item.price) * item.qty)}</p>
          
          <div className="flex items-center gap-3 bg-gray-50 px-2 py-1 rounded-lg">
            <button 
              onClick={() => onUpdateQty(-1)}
              className="p-1 text-gray-400 active:text-primary transition-colors"
            >
              <Minus size={16} strokeWidth={3} />
            </button>
            <span className="font-black text-gray-900 text-xs w-4 text-center">{item.qty}</span>
            <button 
              onClick={() => onUpdateQty(1)}
              className="p-1 text-gray-400 active:text-primary transition-colors"
              disabled={item.qty >= item.stock}
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

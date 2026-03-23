import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { CartItem } from '../../types';
import { fmt } from '../../utils';

interface CartItemRowProps {
  item: CartItem;
  updateQty: (id: string, delta: number) => void;
}

export default function CartItemRow({ item, updateQty }: CartItemRowProps) {
  return (
    <div className="flex items-center gap-4 group bg-gray-50/50 p-4 rounded-xl border-2 border-gray-200/80 shadow-md hover:border-gray-300 transition-all">
      <div className="w-14 h-14 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-100">
        <img src={item.image} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-black text-gray-900 leading-tight mb-0.5 truncate">{item.name}</p>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{fmt(item.price)}</p>
      </div>
      <div className="flex items-center gap-2.5 bg-white p-1.5 rounded-lg border-2 border-gray-100 shadow-sm">
        <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-gray-50 rounded-md transition-all text-gray-400 hover:text-rose-500">
          <Minus size={14} />
        </button>
        <span className="text-sm font-black text-gray-900 w-4 text-center">{item.qty}</span>
        <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-gray-50 rounded-md transition-all text-gray-400 hover:text-primary">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

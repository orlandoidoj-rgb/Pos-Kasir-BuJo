import React, { useState } from 'react';
import { MenuItem } from '../../types/product';
import { BottomSheet } from '../ui/BottomSheet';
import { formatRupiah } from '../../utils/format';
import { Plus, Minus, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProductDetailProps {
  product: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: MenuItem, qty: number, notes?: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAdd 
}) => {
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;

  const handleAdd = () => {
    onAdd(product, qty, notes);
    onClose();
    setQty(1);
    setNotes('');
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={product.name}>
      <div className="flex flex-col gap-6">
        <div className="aspect-video w-full rounded-2xl bg-gray-100 overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-2xl">
              BuJo
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">{product.name}</h2>
            <p className="text-xl font-black text-primary">{formatRupiah(product.price)}</p>
          </div>
          <p className="text-gray-500 text-sm">{product.categoryName || 'Menu Spesial'}</p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <MessageSquare size={16} />
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Level pedas 5, tanpa bawang, sisihkan kecap..."
            className="w-full h-24 p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm resize-none placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-5 bg-gray-50 p-2 rounded-2xl">
            <button 
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-primary active:scale-95"
            >
              <Minus size={20} strokeWidth={3} />
            </button>
            <span className="font-black text-lg text-gray-900 w-4 text-center">{qty}</span>
            <button 
              onClick={() => setQty(qty + 1)}
              disabled={qty >= product.stock}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-primary active:scale-95 disabled:text-gray-300"
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>

          <Button 
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="flex-1 ml-4 py-4 font-black"
          >
            {isOutOfStock ? "HABIS" : `TAMBAH — ${formatRupiah(Number(product.price) * qty)}`}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};

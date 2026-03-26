import { useState } from 'react';
import { MenuItem } from '@/types/product';
import { formatRupiah } from '@/utils/format';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Minus, X, Star, Share2 } from 'lucide-react';

interface ProductDetailProps {
  product: MenuItem | null;
  onClose: () => void;
  onAddToCart: (product: MenuItem, qty: number, notes: string) => void;
}

export function ProductDetail({ product, onClose, onAddToCart }: ProductDetailProps) {
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product, qty, notes);
    setQty(1);
    setNotes('');
    onClose();
  };

  return (
    <BottomSheet isOpen={!!product} onClose={onClose}>
      <div className="relative pb-24" id="product-detail-modal">
        {/* Header Image */}
        <div className="relative h-64 w-full bg-gray-100 overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl bg-gradient-to-br from-orange-50 to-orange-100">
              {product.categoryName?.includes('Drink') ? '🥤' : '🍱'}
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center active:scale-95 transition-transform"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 mt-4 space-y-6">
          <div>
            <div className="flex justify-between items-start gap-4">
              <h2 className="text-xl font-extrabold text-secondary leading-tight">{product.name}</h2>
              <p className="text-primary font-black text-2xl whitespace-nowrap">{formatRupiah(Number(product.price))}</p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center text-xs font-bold text-orange-500">
                <Star className="w-3.5 h-3.5 fill-current mr-1" />
                4.8
              </div>
              <span className="text-gray-300">|</span>
              <p className="text-xs text-secondary/60 font-medium">Terjual 100+</p>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-secondary">Catatan Pesanan</h3>
              <span className="text-[10px] text-gray-400 font-medium">Opsional</span>
            </div>
            <Input
              isTextArea
              placeholder="Contoh: Sangat pedas, tanpa sayur..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 flex items-center gap-4">
          <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-1">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-10 h-10 flex items-center justify-center text-secondary active:scale-75 transition-transform disabled:opacity-30"
              disabled={qty <= 1}
            >
              <Minus className="w-4 h-4" strokeWidth={3} />
            </button>
            <span className="w-10 text-center font-bold text-secondary">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-10 h-10 flex items-center justify-center text-secondary active:scale-75 transition-transform"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
          
          <Button
            fullWidth
            onClick={handleAddToCart}
            id="add-to-cart-confirm-btn"
          >
            Tambah ke Keranjang
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}

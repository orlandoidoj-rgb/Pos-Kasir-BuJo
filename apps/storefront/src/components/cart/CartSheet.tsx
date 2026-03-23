import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatRupiah } from '../../utils/format';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { ChevronLeft, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/Button';

export const CartSheet: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { items, updateQty, removeItem, subtotal } = useCart(slug || '');

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Keranjang Kosong</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">Menu lezat kami menanti Anda. Tambahkan sesuatu untuk memulai pesanan!</p>
        <Button onClick={() => navigate(`/${slug}`)} variant="primary" className="w-full">
          Lihat Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="px-4 py-5 flex items-center gap-4 sticky top-0 bg-white z-10 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <h2 className="text-xl font-black tracking-tight">Keranjang</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
        {items.map((item, idx) => (
          <CartItem 
            key={`${item.id}-${idx}`}
            item={item} 
            onUpdateQty={(delta) => updateQty(item.id, delta, item.notes)}
            onRemove={() => removeItem(item.id, item.notes)}
          />
        ))}
      </div>

      <div className="p-6 bg-gray-50 rounded-t-[32px] border-t border-gray-100 shadow-2xl">
        <CartSummary subtotal={subtotal} />
        <Link to={`/${slug}/checkout`}>
          <Button variant="primary" className="w-full py-4 text-lg font-black mt-6 shadow-xl shadow-primary/20">
            Lanjut ke Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
};

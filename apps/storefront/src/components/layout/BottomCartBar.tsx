import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { formatRupiah } from '@/utils/format';

interface BottomCartBarProps {
  itemCount: number;
  subtotal: number;
}

export function BottomCartBar({ itemCount, subtotal }: BottomCartBarProps) {
  const navigate = useNavigate();
  const { slug } = useParams();

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 animate-slide-up" id="bottom-cart-bar">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate(`/${slug}/cart`)}
          className="w-full flex items-center justify-between px-5 py-4 text-white font-semibold"
          style={{
            background: 'linear-gradient(135deg, #F97316, #EA580C)',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            </div>
            <span className="text-sm">
              Keranjang • {itemCount} item
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">{formatRupiah(subtotal)}</span>
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>
      </div>
    </div>
  );
}

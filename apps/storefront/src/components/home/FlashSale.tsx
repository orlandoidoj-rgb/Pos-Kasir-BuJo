import { useState, useEffect } from 'react';
import { MenuItem } from '@/types/product';
import { formatRupiah } from '@/utils/format';
import { Timer, Zap, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface FlashSaleProps {
  products: MenuItem[];
  onProductClick: (product: MenuItem) => void;
}

export function FlashSale({ products, onProductClick }: FlashSaleProps) {
  const { showToast } = useToast();
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show flash sale with first 4 products
  const flashProducts = products.slice(0, 4);
  if (flashProducts.length === 0) return null;

  return (
    <div className="mt-5" id="flash-sale">
      {/* Header */}
      <div className="px-4 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-promo rounded-lg">
            <Zap className="w-4 h-4 text-white fill-white" />
            <span className="text-white text-sm font-extrabold">Flash Sale</span>
          </div>
          <div className="flex items-center gap-1 text-promo font-bold text-sm">
            <TimeBlock value={timeLeft.hours} />
            <span>:</span>
            <TimeBlock value={timeLeft.minutes} />
            <span>:</span>
            <TimeBlock value={timeLeft.seconds} />
          </div>
        </div>
        <button 
          onClick={() => showToast('Halaman Flash Sale segera hadir!')}
          className="text-primary text-xs font-semibold active:scale-95 transition-transform"
        >
          Lihat Semua
        </button>
      </div>

      {/* Products scroll */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2">
        {flashProducts.map(product => (
          <div
            key={product.id}
            onClick={() => onProductClick(product)}
            className="flex-shrink-0 w-[130px] card overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-100">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-orange-50 to-orange-100">
                  🍽️
                </div>
              )}
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-promo text-white text-[10px] font-bold rounded">
                50% OFF
              </span>
            </div>

            {/* Info */}
            <div className="p-2">
              <p className="text-primary font-bold text-sm">
                {formatRupiah(Number(product.price) * 0.5)}
              </p>
              <p className="text-gray-400 text-[10px] line-through">
                {formatRupiah(product.price)}
              </p>
              {/* Progress bar */}
              <div className="mt-1.5 h-1.5 bg-orange-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-promo rounded-full transition-all"
                  style={{ width: `${Math.random() * 40 + 40}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Sisa {Math.floor(Math.random() * 20 + 5)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimeBlock({ value }: { value: number }) {
  return (
    <span className="bg-secondary text-white text-xs font-bold px-1.5 py-0.5 rounded min-w-[24px] text-center inline-block">
      {String(value).padStart(2, '0')}
    </span>
  );
}

function getTimeLeft() {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const diff = endOfDay.getTime() - now.getTime();
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

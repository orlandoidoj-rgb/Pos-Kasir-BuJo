import { CartItem as ICartItem } from '@/types/cart';
import { formatRupiah } from '@/utils/format';
import { Minus, Plus, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface CartItemProps {
  item: ICartItem;
  onUpdateQty: (delta: number) => void;
  onRemove: () => void;
}

export function CartItem({ item, onUpdateQty, onRemove }: CartItemProps) {
  const subtotal = Number(item.price) * item.qty;

  return (
    <Card className="flex gap-4 p-3 mb-3" noPadding id={`cart-item-${item.id}`}>
      {/* Image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl bg-secondary/5">
            🍱
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h3 className="font-bold text-secondary text-sm leading-snug line-clamp-2">
              {item.name}
            </h3>
            {item.notes && (
              <p className="text-[11px] text-gray-400 mt-0.5 italic line-clamp-1">
                "{item.notes}"
              </p>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-2 -mr-1 text-gray-400 hover:text-red-500 transition-colors"
            id={`remove-btn-${item.id}`}
            aria-label="Hapus item"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="font-extrabold text-primary text-sm">
            {formatRupiah(subtotal)}
          </p>

          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 p-0.5">
            <button
              onClick={() => onUpdateQty(-1)}
              className="w-7 h-7 flex items-center justify-center text-secondary active:scale-90 transition-transform disabled:opacity-30"
              disabled={item.qty <= 1}
            >
              <Minus className="w-3.5 h-3.5" strokeWidth={3} />
            </button>
            <span className="w-8 text-center text-xs font-bold text-secondary">
              {item.qty}
            </span>
            <button
              onClick={() => onUpdateQty(1)}
              className="w-7 h-7 flex items-center justify-center text-secondary active:scale-90 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

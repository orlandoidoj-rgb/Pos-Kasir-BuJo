import { MenuItem } from '@/types/product';
import { formatRupiah } from '@/utils/format';
import { Plus, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ProductCardProps {
  product: MenuItem;
  onClick: (product: MenuItem) => void;
  onAddToCart: (product: MenuItem) => void;
}

export function ProductCard({ product, onClick, onAddToCart }: ProductCardProps) {
  const soldCount = Math.floor(Math.random() * 500 + 100);
  const rating = (4 + Math.random() * 0.9).toFixed(1);
  const inStock = product.stock > 0;

  return (
    <Card
      onClick={() => onClick(product)}
      className="overflow-hidden cursor-pointer flex gap-3 p-3"
      noPadding
      id={`product-card-${product.id}`}
    >
      {/* Image */}
      <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-orange-50 to-orange-100">
            {product.categoryName?.includes('Drink') ? '🥤' : '🍱'}
          </div>
        )}
        
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Habis</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
        <div>
          <h3 className="text-sm font-bold text-secondary line-clamp-1">{product.name}</h3>
          
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center text-[10px] text-orange-500 font-bold">
              <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
              {rating}
            </div>
            <span className="text-[10px] text-gray-300">|</span>
            <span className="text-[10px] text-gray-400">Terjual {soldCount}+</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-extrabold text-primary">
            {formatRupiah(Number(product.price))}
          </span>
          
          {inStock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center active:scale-90 transition-transform shadow-btn"
              id={`add-btn-${product.id}`}
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

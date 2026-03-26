import { MenuItem } from '@/types/product';
import { formatRupiah } from '@/utils/format';
import { ProductCard } from './ProductCard';
import { SkeletonCard } from '@/components/ui/Spinner';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Star, Minus, Plus, ShoppingCart } from 'lucide-react';

interface ProductListProps {
  products: MenuItem[];
  isLoading: boolean;
  onProductClick: (product: MenuItem) => void;
  onAddToCart: (product: MenuItem) => void;
}

export function ProductList({ products, isLoading, onProductClick, onAddToCart }: ProductListProps) {
  if (isLoading) {
    return (
      <div className="px-4 space-y-3 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="px-4 mt-8 text-center">
        <div className="text-4xl mb-3">🍽️</div>
        <p className="text-gray-400 font-medium">Tidak ada menu ditemukan</p>
        <p className="text-gray-300 text-sm mt-1">Coba kategori atau kata kunci lain</p>
      </div>
    );
  }

  return (
    <div className="px-4 mt-4" id="product-list">
      <h2 className="text-lg font-bold text-secondary mb-3">Menu Lengkap</h2>
      <div className="space-y-3 pb-28">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={onProductClick}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}

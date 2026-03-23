import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { useMenu } from '../hooks/useMenu';
import { useCart } from '../hooks/useCart';
import { StoreBanner } from './components/store/StoreBanner';
import { CategoryTabs } from './components/menu/CategoryTabs';
import { ProductGrid } from './components/menu/ProductGrid';
import { ProductDetail } from './components/menu/ProductDetail';
import { MenuItem } from '../types/product';
import { SearchBar } from './components/menu/SearchBar';

export const StorePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { store, isLoading: storeLoading } = useStore(slug || '');
  const { 
    menuItems, 
    categories, 
    activeCategoryId, 
    setActiveCategoryId,
    searchQuery,
    setSearchQuery,
    isLoading: menuLoading 
  } = useMenu(slug || '');
  const { items: cartItems, addItem, updateQty } = useCart(slug || '');

  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  if (storeLoading) return <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Memuat Toko...</div>;
  if (!store) return <div className="p-12 text-center text-gray-700 font-black text-xl">Toko Tidak Ditemukan</div>;

  return (
    <div className="flex flex-col gap-6">
      <StoreBanner store={store} />
      
      <div className="px-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <CategoryTabs 
        categories={categories} 
        activeCategoryId={activeCategoryId} 
        onSelect={setActiveCategoryId} 
      />

      <ProductGrid 
        items={menuItems}
        cartItems={cartItems}
        onAdd={(p) => addItem(p, 1)}
        onRemove={(p) => updateQty(p.id, -1)}
        onProductClick={setSelectedProduct}
      />

      <ProductDetail 
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAdd={addItem}
      />
    </div>
  );
};

import React from 'react';
import { useStore } from '../../hooks/useStore';
import { useMenu } from '../../hooks/useMenu';
import { useCart } from '../../hooks/useCart';
import { StoreBanner } from './StoreBanner';
import { CategoryTabs } from '../menu/CategoryTabs';
import { ProductGrid } from '../menu/ProductGrid';
import { ProductDetail } from '../menu/ProductDetail';
import { MenuItem } from '../../types/product';
import { SearchBar } from '../menu/SearchBar';

export const StorePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <StoreBanner />
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <SearchBar />
        <CategoryTabs />
      </div>
      <main className="container mx-auto px-4 py-6">
        <ProductGrid />
      </main>
      <ProductDetail />
    </div>
  );
};

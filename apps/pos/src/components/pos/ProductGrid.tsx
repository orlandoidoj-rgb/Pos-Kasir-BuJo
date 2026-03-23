import React from 'react';
import { Search } from 'lucide-react';
import { POSProduct } from '../../types';
import { CATEGORIES } from '../../config';
import ProductCard from './ProductCard';

interface ProductGridProps {
  activeCategory: string;
  search: string;
  setSearch: (val: string) => void;
  filteredProducts: POSProduct[];
  cart: { id: string; qty: number }[];
  addToCart: (p: POSProduct) => void;
  screen: 'setup' | 'ordering' | 'login';
  orderType: string;
}

export default function ProductGrid({
  activeCategory, search, setSearch,
  filteredProducts, cart, addToCart,
  screen, orderType
}: ProductGridProps) {
  return (
    <main className="flex-1 flex flex-col bg-white overflow-hidden">
       <div className="p-6 border-b border-gray-50 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-black text-gray-900 tracking-tight">Menu Utama</h2>
             <div className="h-6 w-px bg-gray-100"></div>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
               {CATEGORIES.find(c => c.id === activeCategory)?.name}
             </p>
          </div>
          <div className="relative w-80">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               value={search} 
               onChange={e => setSearch(e.target.value)}
               className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold placeholder:font-normal"
               placeholder="Cari Menu Favorit..."
             />
          </div>
       </div>

       <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#f8fafc]/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
             {filteredProducts.map((p: POSProduct) => (
               <ProductCard
                 key={p.id}
                 product={p}
                 orderType={orderType}
                 cartQty={cart.find(i => i.id === p.id)?.qty}
                 onAdd={() => addToCart(p)}
                 disabled={screen === 'setup'}
               />
             ))}
          </div>
       </div>
    </main>
  );
}

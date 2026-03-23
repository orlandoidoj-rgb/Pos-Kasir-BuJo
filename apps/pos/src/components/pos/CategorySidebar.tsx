import React from 'react';
import { CATEGORIES } from '../../config';

interface CategorySidebarProps {
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

export default function CategorySidebar({ activeCategory, setActiveCategory }: CategorySidebarProps) {
  return (
    <aside className="w-24 bg-white border-r border-gray-100 flex flex-col shrink-0 overflow-hidden py-6">
       <div className="flex flex-col gap-2 px-3">
          {CATEGORIES.map(cat => (
             <button 
               key={cat.id} 
               onClick={() => setActiveCategory(cat.id)}
               className={`flex flex-col items-center justify-center gap-2 py-5 rounded-2xl transition-all group ${
                  activeCategory === cat.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-400 hover:bg-gray-50'
               }`}
             >
                <span className="material-symbols-outlined text-2xl leading-none group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <span className="text-[10px] font-black uppercase tracking-tighter">{cat.name}</span>
             </button>
          ))}
       </div>
    </aside>
  );
}

import React from 'react';
import { Category } from '../../types/product';
import { clsx } from 'clsx';

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId?: string;
  onSelect: (id?: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeCategoryId, onSelect }) => {
  return (
    <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 -mx-4 px-4 py-3 mb-4 overflow-x-auto no-scrollbar">
      <div className="flex gap-2">
        <button
          onClick={() => onSelect(undefined)}
          className={clsx(
            'px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all',
            !activeCategoryId ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
          )}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all',
              activeCategoryId === cat.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

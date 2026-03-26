import { Category } from '@/types/product';

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId?: string;
  onSelect: (id?: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'makanan': '🍛',
  'minuman': '🥤',
  'snack': '🍿',
  'dessert': '🍰',
  'paket': '📦',
};

function getCategoryIcon(name: string): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(k)) return v;
  }
  return '🍽️';
}

export function CategoryTabs({ categories, activeCategoryId, onSelect }: CategoryTabsProps) {
  return (
    <div className="sticky top-[60px] z-20 bg-bg-gray pt-4 pb-2" id="category-tabs">
      <div className="px-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {/* All button */}
          <button
            onClick={() => onSelect(undefined)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
              whitespace-nowrap flex-shrink-0 transition-all duration-200
              ${!activeCategoryId
                ? 'bg-primary text-white shadow-btn'
                : 'bg-white text-gray-600 border border-gray-200'
              }
            `}
          >
            <span>🍚</span>
            Semua
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                whitespace-nowrap flex-shrink-0 transition-all duration-200
                ${activeCategoryId === cat.id
                  ? 'bg-primary text-white shadow-btn'
                  : 'bg-white text-gray-600 border border-gray-200'
                }
              `}
            >
              <span>{getCategoryIcon(cat.name)}</span>
              {cat.name}
            </button>
          ))}

          {/* Promo tab */}
          <button
            onClick={() => onSelect('promo')}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
              whitespace-nowrap flex-shrink-0 transition-all duration-200
              ${activeCategoryId === 'promo'
                ? 'bg-primary text-white shadow-btn'
                : 'bg-white text-gray-600 border border-gray-200'
              }
            `}
          >
            <span>⭐</span>
            Promo
          </button>
        </div>
      </div>
    </div>
  );
}

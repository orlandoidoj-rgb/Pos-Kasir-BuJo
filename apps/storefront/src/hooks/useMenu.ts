import { useState, useEffect, useMemo } from 'react';
import { MenuItem, Category } from '../types/product';
import { getMenu, getCategories } from '../services/store.api';

export function useMenu(slug: string) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setIsLoading(true);
    Promise.all([
      getMenu(slug),
      getCategories(slug)
    ])
      .then(([items, cats]) => {
        setMenuItems(items);
        setCategories(cats);
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = !activeCategoryId || item.categoryId === activeCategoryId;
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategoryId, searchQuery]);

  return {
    menuItems: filteredItems,
    categories,
    activeCategoryId,
    setActiveCategoryId,
    searchQuery,
    setSearchQuery,
    isLoading,
    error
  };
}

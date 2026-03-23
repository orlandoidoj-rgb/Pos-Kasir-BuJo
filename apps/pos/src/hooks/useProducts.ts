import { useState, useMemo, useCallback } from 'react';
import { POSProduct, OrderType } from '../types';
import { loadAllProducts } from '../utils';

export function useProducts(selectedBranchId: string, orderType: OrderType) {
  const [activeCategory, setActiveCategory] = useState('1');
  const [search, setSearch] = useState('');
  
  const [allProducts, setAllProducts] = useState<POSProduct[]>(loadAllProducts);

  const reloadProducts = useCallback(() => {
    setAllProducts(loadAllProducts());
  }, []);

  const branchProducts = useMemo(() => 
    allProducts.filter(p => p.branchActivations[selectedBranchId] === true), 
  [allProducts, selectedBranchId]);

  const filteredProducts = useMemo(() => 
    branchProducts.filter(p => p.category === activeCategory && p.name.toLowerCase().includes(search.toLowerCase())),
  [branchProducts, activeCategory, search]);

  return {
    activeCategory, setActiveCategory,
    search, setSearch,
    allProducts, setAllProducts, 
    branchProducts, filteredProducts,
    reloadProducts
  };
}

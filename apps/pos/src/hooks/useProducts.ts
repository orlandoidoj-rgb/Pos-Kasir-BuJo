import { useState, useEffect, useMemo, useCallback } from 'react';
import { POSProduct, OrderType } from '../types';

interface APIProduct {
  id: string;
  name: string;
  price: string;
  purchasePrice: string;
  categoryId: string;
  categoryName: string;
  unit: string;
  image?: string;
  isSellable: boolean;
  stock: number;
}

export function useProducts(selectedBranchId: string, orderType: OrderType) {
  const [activeCategory, setActiveCategory] = useState('1');
  const [search, setSearch] = useState('');
  const [allProducts, setAllProducts] = useState<POSProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  const reloadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?branchId=${selectedBranchId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const mapped = json.data.map((p: APIProduct) => ({
          id: p.id,
          name: p.name,
          hpp: parseFloat(p.purchasePrice) || 0,
          allPrices: {
            'Dine-in': parseFloat(p.price) || 0,
            'Take-away': parseFloat(p.price) || 0,
            'Shopee': parseFloat(p.price) || 0,
            'Grab': parseFloat(p.price) || 0,
            'Gofood': parseFloat(p.price) || 0,
          },
          category: p.categoryId,
          image: p.image,
          unit: p.unit,
          branchActivations: { [selectedBranchId]: p.isSellable && p.stock > 0 },
        }));
        setAllProducts(mapped);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    if (selectedBranchId) {
      reloadProducts();
    }
  }, [selectedBranchId, reloadProducts]);

  const branchProducts = useMemo(() =>
    allProducts.filter(p => p.branchActivations[selectedBranchId] === true),
    [allProducts, selectedBranchId]);

  const filteredProducts = useMemo(() =>
    branchProducts.filter(p =>
      p.category === activeCategory &&
      p.name.toLowerCase().includes(search.toLowerCase())
    ),
    [branchProducts, activeCategory, search]);

  return {
    activeCategory, setActiveCategory,
    search, setSearch,
    allProducts, setAllProducts,
    branchProducts, filteredProducts,
    reloadProducts,
    loading,
  };
}

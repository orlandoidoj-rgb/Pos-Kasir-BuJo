import { useState, useEffect, useMemo } from 'react';
import { CartItem } from '../types/cart';
import { MenuItem } from '../types/product';

export function useCart(slug: string) {
  const storageKey = `warung_bujo_cart_${slug}`;
  
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const addItem = (product: MenuItem, qty: number, notes?: string) => {
    setItems(prev => {
      // Find item with same ID AND same notes (if we want to separate by notes)
      // For simplicity here, let's just find by ID
      const existingIndex = prev.findIndex(i => i.id === product.id && i.notes === notes);
      
      if (existingIndex > -1) {
        const newItems = [...prev];
        newItems[existingIndex].qty += qty;
        return newItems;
      }
      
      return [...prev, { ...product, qty, notes }];
    });
  };

  const updateQty = (id: string, delta: number, notes?: string) => {
    setItems(prev => {
      return prev.map(item => {
        if (item.id === id && item.notes === notes) {
          const newQty = Math.max(0, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(item => item.qty > 0);
    });
  };

  const removeItem = (id: string, notes?: string) => {
    setItems(prev => prev.filter(item => !(item.id === id && item.notes === notes)));
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.qty, 0);
  }, [items]);

  return {
    items,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    subtotal,
    itemCount
  };
}

import { useState, useMemo } from 'react';
import { CartItem, POSProduct, OrderSetup } from '../types';

export function useCart(orderSetup: OrderSetup) {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [cartDiscount, setCartDiscount] = useState(0);
  const [pointsRedeemed, setPointsRedeemed] = useState(false);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const tax = 0;
  
  const maxPointsDiscount = orderSetup.loyaltyCustomer ? orderSetup.loyaltyCustomer.points * 100 : 0;
  const pointsDiscount = pointsRedeemed ? Math.min(maxPointsDiscount, subtotal + tax) : 0;
  const discount = cartDiscount + pointsDiscount;
  const total = Math.max(0, subtotal + tax - discount);

  const addToCart = (product: POSProduct, screen: string) => {
    if (screen === 'setup') return;
    const price = product.allPrices[orderSetup.orderType] ?? 0;
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1, price }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.flatMap(i => {
      if (i.id !== id) return [i];
      const newQty = i.qty + delta;
      return newQty <= 0 ? [] : [{ ...i, qty: newQty }];
    }));
  };

  const clearCart = () => setCart([]);

  return {
    cart, setCart,
    cartDiscount, setCartDiscount,
    pointsRedeemed, setPointsRedeemed,
    subtotal, tax, maxPointsDiscount, pointsDiscount, discount, total,
    addToCart, updateQty, clearCart
  };
}

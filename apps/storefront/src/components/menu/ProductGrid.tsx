import React from 'react';
import { MenuItem } from '../../types/product';
import { ProductCard } from './ProductCard';
import { CartItem } from '../../types/cart';

interface ProductGridProps {
  items: MenuItem[];
  cartItems: CartItem[];
  onAdd: (product: MenuItem) => void;
  onRemove: (product: MenuItem) => void;
  onProductClick: (product: MenuItem) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  items, 
  cartItems, 
  onAdd, 
  onRemove,
  onProductClick
}) => {
  const getCartQty = (productId: string) => {
    return cartItems
      .filter(item => item.id === productId)
      .reduce((sum, item) => sum + item.qty, 0);
  };

  return (
    <div className="grid grid-cols-2 gap-4 px-4 pb-20">
      {items.map((item) => (
        <ProductCard
          key={item.id}
          product={item}
          cartQty={getCartQty(item.id)}
          onAdd={() => onAdd(item)}
          onRemove={() => onRemove(item)}
          onClick={() => onProductClick(item)}
        />
      ))}
    </div>
  );
};

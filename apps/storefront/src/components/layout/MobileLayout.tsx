import { Outlet, useParams } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useStore } from '@/hooks/useStore';
import { createContext, useContext } from 'react';
import { CartItem } from '@/types/cart';
import { MenuItem } from '@/types/product';
import { StoreInfo } from '@/types/store';

interface CartContextType {
  items: CartItem[];
  addItem: (product: MenuItem, qty: number, notes?: string) => void;
  updateQty: (id: string, delta: number, notes?: string) => void;
  removeItem: (id: string, notes?: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

interface StoreContextType {
  store: StoreInfo | null;
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
}

export const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  updateQty: () => {},
  removeItem: () => {},
  clearCart: () => {},
  subtotal: 0,
  itemCount: 0,
});

export const StoreContext = createContext<StoreContextType>({
  store: null,
  isLoading: true,
  error: null,
  isOpen: false,
});

export function useCartContext() {
  return useContext(CartContext);
}

export function useStoreContext() {
  return useContext(StoreContext);
}

export function MobileLayout() {
  const { slug } = useParams();
  const cart = useCart(slug || '');
  const storeData = useStore(slug || '');

  return (
    <StoreContext.Provider value={storeData}>
      <CartContext.Provider value={cart}>
        <div className="min-h-screen min-h-[100dvh] bg-bg-gray max-w-lg mx-auto relative">
          <Outlet />
        </div>
      </CartContext.Provider>
    </StoreContext.Provider>
  );
}

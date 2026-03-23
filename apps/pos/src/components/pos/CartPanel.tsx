import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { OrderSetup, CartItem, PaymentMethod } from '../../types';
import OrderTypeSetup from './OrderTypeSetup';
import CartView from './CartView';
import PaymentView from './PaymentView';

interface CartPanelProps {
  screen: 'setup' | 'ordering' | 'login';
  setScreen: (screen: 'setup' | 'ordering') => void;
  showPayment: boolean;
  setShowPayment: (val: boolean) => void;
  orderSetup: OrderSetup;
  setOrderSetup: (setup: OrderSetup) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  updateQty: (id: string, delta: number) => void;
  subtotal: number;
  tax: number;
  total: number;
  handleConfirmPayment: (method: PaymentMethod, paid: number) => void;
}

export default function CartPanel({
  screen, setScreen, showPayment, setShowPayment,
  orderSetup, setOrderSetup, cart, setCart, updateQty,
  subtotal, tax, total, handleConfirmPayment
}: CartPanelProps) {
  return (
    <aside className="w-[28rem] bg-white border-l border-gray-100 flex flex-col shrink-0 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.05)] relative z-20">
      <AnimatePresence mode="wait">
        {showPayment ? (
          <PaymentView 
            orderSetup={orderSetup}
            total={total}
            setShowPayment={setShowPayment}
            handleConfirmPayment={handleConfirmPayment}
          />
        ) : screen === 'setup' ? (
          <OrderTypeSetup 
            orderSetup={orderSetup}
            setOrderSetup={setOrderSetup}
            setScreen={setScreen}
          />
        ) : (
          <CartView 
            cart={cart}
            orderSetup={orderSetup}
            setScreen={setScreen}
            setCart={setCart}
            updateQty={updateQty}
            subtotal={subtotal}
            tax={tax}
            total={total}
            setShowPayment={setShowPayment}
          />
        )}
      </AnimatePresence>
    </aside>
  );
}

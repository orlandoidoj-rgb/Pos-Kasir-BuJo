import React from 'react';
import { formatRupiah } from '../../utils/format';

interface CartSummaryProps {
  subtotal: number;
  discount?: number;
  deliveryFee?: number;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ 
  subtotal, 
  discount = 0, 
  deliveryFee = 0 
}) => {
  const total = subtotal - discount + deliveryFee;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-gray-500 font-medium">
        <span>Subtotal</span>
        <span>{formatRupiah(subtotal)}</span>
      </div>
      
      {discount > 0 && (
        <div className="flex justify-between text-sm text-success font-bold">
          <span>Diskon</span>
          <span>-{formatRupiah(discount)}</span>
        </div>
      )}

      {deliveryFee > 0 && (
        <div className="flex justify-between text-sm text-gray-500 font-medium">
          <span>Ongkir</span>
          <span>{formatRupiah(deliveryFee)}</span>
        </div>
      )}

      <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-2">
        <span className="text-base font-black text-gray-900 uppercase tracking-tight">Total</span>
        <span className="text-2xl font-black text-primary">{formatRupiah(total)}</span>
      </div>
    </div>
  );
};

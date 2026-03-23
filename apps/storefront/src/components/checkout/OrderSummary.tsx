import React from 'react';
import { CartItem } from '../../types/cart';
import { formatRupiah } from '../../utils/format';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee?: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  items, 
  subtotal, 
  deliveryFee = 0 
}) => {
  return (
    <div className="bg-gray-50 rounded-3xl p-6 space-y-6">
      <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Ringkasan Pesanan</h3>
      
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium whitespace-nowrap">
              {item.qty}x <span className="text-gray-900 font-bold">{item.name}</span>
            </span>
            <span className="font-black text-gray-900">{formatRupiah(Number(item.price) * item.qty)}</span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200 space-y-3">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-gray-500">Subtotal</span>
          <span className="text-gray-900">{formatRupiah(subtotal)}</span>
        </div>
        
        {deliveryFee > 0 && (
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-500">Ongkir</span>
            <span className="text-gray-900">{formatRupiah(deliveryFee)}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-black text-gray-900">TOTAL</span>
          <span className="text-2xl font-black text-primary">{formatRupiah(subtotal + deliveryFee)}</span>
        </div>
      </div>
    </div>
  );
};

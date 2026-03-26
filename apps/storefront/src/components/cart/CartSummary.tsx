import { Card } from '@/components/ui/Card';
import { formatRupiah } from '@/utils/format';

interface CartSummaryProps {
  itemCount: number;
  subtotal: number;
  deliveryFee?: number;
  discount?: number;
}

export function CartSummary({ itemCount, subtotal, deliveryFee, discount = 0 }: CartSummaryProps) {
  const total = subtotal - discount + (deliveryFee || 0);

  return (
    <Card className="space-y-3" id="cart-summary">
      <h3 className="text-sm font-bold text-secondary mb-3">Ringkasan Belanja</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal ({itemCount} menu)</span>
          <span className="text-secondary font-medium">{formatRupiah(subtotal)}</span>
        </div>
        
        {deliveryFee !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Ongkos Kirim</span>
            <span className="text-secondary font-medium">{formatRupiah(deliveryFee)}</span>
          </div>
        )}
        
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Diskon</span>
            <span className="text-green-500 font-medium">-{formatRupiah(discount)}</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-secondary font-bold text-base">Total Pembayaran</span>
        <span className="text-primary font-extrabold text-xl">{formatRupiah(total)}</span>
      </div>
    </Card>
  );
}

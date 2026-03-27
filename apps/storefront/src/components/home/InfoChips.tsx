import { StoreInfo } from '@/types/store';
import { Truck, Store, Clock, ShoppingBag } from 'lucide-react';
import { formatRupiah } from '@/utils/format';

interface InfoChipsProps {
  store?: StoreInfo | null;
}

export function InfoChips({ store }: InfoChipsProps) {
  const deliveryFee = store?.deliveryFee ?? 10000;
  const minOrder = store?.minOrderAmount ?? 20000;
  const prepTime = store?.estimatedPrepTime ?? 25;

  return (
    <div className="px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar" id="info-chips">
      {store?.deliveryEnabled && (
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-100">
          <Truck className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-bold text-primary">
            Ongkir {formatRupiah(deliveryFee)}
          </span>
        </div>
      )}

      {store?.pickupEnabled && (
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
          <Store className="w-3.5 h-3.5 text-green-600" />
          <span className="text-[11px] font-bold text-green-700">Ambil Sendiri</span>
        </div>
      )}

      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
        <Clock className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-[11px] font-bold text-blue-700">{prepTime} menit</span>
      </div>

      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-full border border-purple-100">
        <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
        <span className="text-[11px] font-bold text-purple-700">
          Min {formatRupiah(minOrder)}
        </span>
      </div>
    </div>
  );
}

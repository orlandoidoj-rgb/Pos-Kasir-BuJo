import React from 'react';
import { OnlineOrder } from '../../types/order';
import { formatRupiah, formatDate } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { ChevronRight, Package, Truck, Store } from 'lucide-react';

interface OrderCardProps {
  order: OnlineOrder;
  onClick: () => void;
}

const STATUS_CONFIG: Record<string, { variant: any; label: string }> = {
  "Pending":          { variant: "warning",   label: "Menunggu" },
  "Paid":             { variant: "primary",   label: "Dibayar" },
  "Confirmed":        { variant: "primary",   label: "Dikonfirmasi" },
  "Preparing":        { variant: "warning",   label: "Disiapkan" },
  "Ready":            { variant: "success",   label: "Siap" },
  "Out for Delivery": { variant: "primary",   label: "Diantar" },
  "Completed":        { variant: "success",   label: "Selesai" },
  "Cancelled":        { variant: "danger",    label: "Batal" },
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const config = STATUS_CONFIG[order.status] || { variant: "ghost", label: order.status };

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm active:scale-[0.98] transition-transform flex flex-col gap-4 cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${order.fulfillmentType === 'delivery' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
            {order.fulfillmentType === 'delivery' ? <Truck size={20} /> : <Store size={20} />}
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{order.orderNumber}</p>
            <p className="text-[10px] font-bold text-gray-400">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
          <p className="text-lg font-black text-gray-900 tracking-tight">{formatRupiah(order.total)}</p>
        </div>
        <div className="flex items-center gap-1 text-primary font-bold text-sm">
          Detail <ChevronRight size={16} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};

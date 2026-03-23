import React from 'react';
import { OnlineOrder, ONLINE_STATUS_CONFIG } from '../../types/online-order';
import { fmt, formatPhoneDisplay } from '../../utils/format';
import { MapPin, Phone, Clock, MessageSquare, ChevronRight } from 'lucide-react';

interface OnlineOrderCardProps {
  order: OnlineOrder;
  onAction: (orderId: string, action: string) => void;
}

export default function OnlineOrderCard({ order, onAction }: OnlineOrderCardProps) {
  const config = ONLINE_STATUS_CONFIG[order.status];
  
  const timeElapsed = () => {
    const start = new Date(order.createdAt).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / 60000);
    if (diff < 1) return 'Baru saja';
    if (diff < 60) return `${diff} menit lalu`;
    return `${Math.floor(diff / 60)} jam lalu`;
  };

  const isUrgent = order.status === 'Paid' && (new Date().getTime() - new Date(order.createdAt).getTime()) > 300000; // 5 mins

  return (
    <div className={`
      bg-white rounded-[32px] border transition-all overflow-hidden flex flex-col
      ${isUrgent ? 'border-rose-200 ring-2 ring-rose-50' : 'border-gray-100'}
    `}>
      {/* Header Stat */}
      <div className={`px-6 py-3 flex items-center justify-between ${config.color} bg-opacity-30`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className={`text-[10px] font-black uppercase tracking-widest ${config.textColor}`}>
            {config.label}
          </span>
        </div>
        <span className={`text-[10px] font-bold ${isUrgent ? 'text-rose-600 animate-pulse' : 'text-gray-400'}`}>
          {timeElapsed()}
        </span>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Order Info */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{order.orderNumber}</p>
            <h3 className="text-xl font-black text-gray-900">{order.customerName}</h3>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-gray-900">{fmt(order.total)}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {order.fulfillmentType === 'delivery' ? '🛵 Delivery' : '🏪 Pickup'}
            </p>
          </div>
        </div>

        {/* Contact & Address */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 text-xs text-gray-600 font-bold">
            <Phone size={14} className="text-gray-400" />
            {formatPhoneDisplay(order.customerPhone)}
          </div>
          {order.fulfillmentType === 'delivery' && (
            <div className="flex items-start gap-3 text-xs text-gray-600 font-bold leading-relaxed">
              <MapPin size={14} className="text-gray-400 mt-0.5" />
              <div>
                <p>{order.deliveryAddress}</p>
                {order.deliveryNotes && (
                   <p className="text-[10px] text-gray-400 font-medium mt-1">*{order.deliveryNotes}</p>
                )}
              </div>
            </div>
          )}
          {order.pickupScheduledAt && (
             <div className="flex items-center gap-3 text-xs text-gray-600 font-bold">
               <Clock size={14} className="text-gray-400" />
               Ambil pada: {order.pickupScheduledAt}
             </div>
          )}
        </div>

        {/* Items List */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-xs">
              <div className="flex-1">
                <p className="text-gray-900 font-black">{item.qty}x {item.productName}</p>
                {item.notes && <p className="text-[10px] text-gray-400 italic">"{item.notes}"</p>}
              </div>
              <p className="font-bold text-gray-900">{fmt(item.subtotal)}</p>
            </div>
          ))}
          {order.customerNotes && (
             <div className="pt-2 border-t border-gray-200 mt-2 flex gap-2">
               <MessageSquare size={12} className="text-gray-400 mt-0.5" />
               <p className="text-[10px] text-gray-600 font-medium italic">"{order.customerNotes}"</p>
             </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {config.actions.map((btn, idx) => (
            <button
              key={idx}
              onClick={() => onAction(order.id, btn.action)}
              className={`
                flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all
                ${btn.variant === 'primary' ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02]' : ''}
                ${btn.variant === 'danger' ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100' : ''}
                ${btn.variant === 'secondary' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : ''}
              `}
            >
              <span className="text-sm">{btn.icon}</span>
              {btn.label}
            </button>
          ))}
          
          {/* Status specific dynamic actions */}
          {order.status === 'Ready' && (
            <>
              {order.fulfillmentType === 'pickup' ? (
                <button
                  onClick={() => onAction(order.id, 'complete')}
                  className="flex-1 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-200"
                >
                  ✅ Sudah Diambil
                </button>
              ) : (
                <button
                  onClick={() => onAction(order.id, 'assign_driver')}
                  className="flex-1 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-200"
                >
                  🛵 Kirim / Assign Driver
                </button>
              )}
            </>
          )}

          <button 
            onClick={() => onAction(order.id, 'chat_customer')}
            className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-100 transition-all border border-emerald-100"
            title="Chat Customer (WA)"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

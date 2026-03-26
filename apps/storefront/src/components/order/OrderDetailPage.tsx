import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../layout/Header';
import { StatusTimeline } from './StatusTimeline';
import { DriverInfo } from './DriverInfo';
import { StatusBadge, getStatusLabel } from '@/components/ui/Badge';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { getOrder } from '../../services/order.api';
import { OnlineOrder } from '../../types/order';
import { formatRupiah, formatDate } from '../../utils/format';
import { generateWhatsAppLink, generateOrderWhatsAppMessage } from '../../utils/whatsapp';
import { MapPin, MessageCircle, Clock } from 'lucide-react';

export function OrderDetailPage() {
  const { orderId, slug } = useParams();
  const [order, setOrder] = useState<OnlineOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = () => {
      getOrder(orderId)
        .then(setOrder)
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    fetchOrder();

    // Poll every 5 seconds for non-terminal status
    const interval = setInterval(() => {
      if (order && ['Completed', 'Cancelled'].includes(order.status)) {
        clearInterval(interval);
        return;
      }
      getOrder(orderId).then(setOrder).catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, order?.status]);

  if (loading) return <FullPageSpinner />;
  if (!order) {
    return (
      <div>
        <Header title="Detail Pesanan" showBack showCart={false} showSearch={false} />
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
          <span className="text-4xl mb-3">😕</span>
          <p className="text-gray-400 font-medium">Pesanan tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const statusLabel = getStatusLabel(order.status);
  const isDelivery = order.fulfillmentType === 'delivery';

  return (
    <div className="pb-8" id="order-detail-page">
      <Header title="Detail Pesanan" showBack showCart={false} showSearch={false} />

      <div className="px-4 mt-4 space-y-4">
        {/* Status Card */}
        <div className="card p-5">
          {/* Big status */}
          <div className="text-center mb-4">
            <StatusBadge status={order.status} size="md" />
            <h2 className="text-xl font-bold text-secondary mt-3">
              {statusLabel}
            </h2>
            {order.status === 'Preparing' && (
              <p className="text-sm text-gray-400 mt-1 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                Estimasi selesai: 15 menit
              </p>
            )}
            {order.status === 'Out for Delivery' && (
              <p className="text-sm text-gray-400 mt-1 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                Estimasi tiba: 15 menit
              </p>
            )}
          </div>

          {/* Timeline */}
          <StatusTimeline currentStatus={order.status} />
        </div>

        {/* Driver info (only when Out for Delivery) */}
        {order.status === 'Out for Delivery' && (
          <DriverInfo
            name="Pak Budi"
            phone="0812-3456-7001"
            orderNumber={order.orderNumber}
          />
        )}

        {/* Order Details */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-secondary mb-3">Detail Pesanan</h3>

          <div className="text-xs text-gray-400 mb-3">
            <p>#{order.orderNumber}</p>
            <p>{formatDate(order.createdAt)}</p>
          </div>

          {/* Items */}
          <div className="space-y-2 border-b border-gray-100 pb-3 mb-3">
            {order.items?.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.qty}x {item.productName}</span>
                  <span className="text-secondary font-medium">{formatRupiah(item.subtotal)}</span>
                </div>
                {item.notes && (
                  <p className="text-[11px] text-gray-400 italic ml-6">{item.notes}</p>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-secondary">{formatRupiah(order.subtotal)}</span>
            </div>
            {isDelivery && (
              <div className="flex justify-between">
                <span className="text-gray-500">Ongkir</span>
                <span className="text-secondary">{formatRupiah(order.deliveryFee)}</span>
              </div>
            )}
            {Number(order.discount) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Voucher</span>
                <span className="text-success font-semibold">-{formatRupiah(order.discount)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between">
              <span className="font-bold text-secondary">Total</span>
              <span className="font-extrabold text-lg text-primary">{formatRupiah(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {isDelivery && order.deliveryAddress && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-secondary mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Alamat Pengiriman
            </h3>
            <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
            {order.deliveryNotes && (
              <p className="text-xs text-gray-400 mt-1">{order.deliveryNotes}</p>
            )}
          </div>
        )}

        {/* Chat Store */}
        <a
          href={generateWhatsAppLink('081234567890', generateOrderWhatsAppMessage(order.orderNumber, 'Warung BuJo'))}
          target="_blank"
          rel="noopener noreferrer"
          className="card p-4 flex items-center justify-center gap-2 text-emerald-600 font-semibold text-sm active:bg-emerald-50 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Chat Toko via WhatsApp
        </a>
      </div>
    </div>
  );
}

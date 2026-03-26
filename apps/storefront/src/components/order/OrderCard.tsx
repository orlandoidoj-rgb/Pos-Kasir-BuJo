import { OnlineOrder } from '../../types/order';
import { StatusBadge } from '../ui/Badge';
import { formatRupiah, formatTime } from '../../utils/format';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, MessageCircle, RefreshCw, Star } from 'lucide-react';

interface OrderCardProps {
  order: OnlineOrder;
}

export function OrderCard({ order }: OrderCardProps) {
  const navigate = useNavigate();
  const { slug } = useParams();

  const isTerminal = ['Completed', 'Cancelled'].includes(order.status);
  const isActive = !isTerminal;

  // Build item summary
  const itemSummary = order.items?.slice(0, 2).map(i => `${i.qty}x ${i.productName}`).join(', ') || '';
  const remainingItems = (order.items?.length || 0) - 2;

  return (
    <div className="card p-4 mb-3 active:shadow-card-hover transition-shadow" id={`order-card-${order.id}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <StatusBadge status={order.status} />
        <span className="text-xs text-gray-400">
          #{order.orderNumber} • {formatTime(order.createdAt)}
        </span>
      </div>

      {/* Items */}
      <p className="text-sm text-gray-600 line-clamp-1">{itemSummary}</p>
      {remainingItems > 0 && (
        <p className="text-xs text-gray-400 mt-0.5">+{remainingItems} item lainnya</p>
      )}

      {/* Total */}
      <p className="text-sm font-bold text-secondary mt-3">
        Total: {formatRupiah(order.total)}
      </p>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        {isActive && (
          <button
            onClick={() => navigate(`/${slug}/orders/${order.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold active:scale-95 transition-transform"
          >
            <Eye className="w-3.5 h-3.5" />
            Lacak Pesanan
          </button>
        )}

        {order.status === 'Completed' && (
          <>
            <button
              onClick={() => navigate(`/${slug}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold active:scale-95 transition-transform"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Pesan Lagi
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-star/10 text-star text-xs font-semibold active:scale-95 transition-transform">
              <Star className="w-3.5 h-3.5" />
              Rating
            </button>
          </>
        )}

        {!isActive && (
          <button className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-semibold active:scale-95 transition-transform">
            <MessageCircle className="w-3.5 h-3.5" />
            Chat
          </button>
        )}
      </div>
    </div>
  );
}

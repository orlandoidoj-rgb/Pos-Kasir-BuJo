import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { OrderCard } from './OrderCard';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { getCustomerOrders } from '@/services/customer.api';
import { OnlineOrder } from '@/types/order';
import { getItem } from '@/utils/storage';
import { ClipboardList } from 'lucide-react';

type Tab = 'active' | 'completed' | 'cancelled';

export function OrderListPage() {
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('active');

  const customerId = getItem<string>('warung_bujo_customer', '');

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }
    getCustomerOrders(customerId)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [customerId]);

  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return orders.filter(o => !['Completed', 'Cancelled'].includes(o.status));
      case 'completed':
        return orders.filter(o => o.status === 'Completed');
      case 'cancelled':
        return orders.filter(o => o.status === 'Cancelled');
    }
  }, [orders, activeTab]);

  const activeCount = orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)).length;

  if (loading) return <FullPageSpinner />;

  return (
    <div id="order-list-page">
      <Header title="Pesanan Saya" showBack showCart={false} showSearch={false} />

      {/* Tabs */}
      <div className="sticky top-[60px] z-20 bg-white border-b border-gray-100">
        <div className="flex">
          {([
            { key: 'active' as Tab, label: 'Aktif', count: activeCount },
            { key: 'completed' as Tab, label: 'Selesai' },
            { key: 'cancelled' as Tab, label: 'Batal' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-1 py-3 text-sm font-semibold transition-all relative
                ${activeTab === tab.key
                  ? 'text-primary'
                  : 'text-gray-400'
                }
              `}
            >
              {tab.label}
              {tab.count ? ` (${tab.count})` : ''}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      <div className="px-4 mt-4 pb-8">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <ClipboardList className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium text-sm">Belum ada pesanan</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  );
}

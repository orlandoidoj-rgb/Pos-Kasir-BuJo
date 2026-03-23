import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../../hooks/useCustomer';
import { getCustomerOrders } from '../../services/customer.api';
import { OnlineOrder } from '../../types/order';
import { OrderCard } from './OrderCard';
import { ChevronLeft, ClipboardList, Search } from 'lucide-react';
import { Button } from '../ui/Button';

export const OrderListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { customer, isLoading: customerLoading } = useCustomer();
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (customer) {
      setIsLoading(true);
      getCustomerOrders(customer.id)
        .then(setOrders)
        .finally(() => setIsLoading(false));
    } else if (!customerLoading) {
      setIsLoading(false);
    }
  }, [customer, customerLoading]);

  if (customerLoading || isLoading) {
    return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Memuat riwayat pesanan...</div>;
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-300">
          <Search size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Belum Ada Riwayat</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">Silakan lakukan pesanan pertama Anda atau masukkan nomor HP di halaman checkout.</p>
        <Button onClick={() => navigate(`/${slug}`)} className="w-full">
          Mulai Pesan
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-4 py-5 flex items-center gap-4 sticky top-0 bg-white z-10 border-b border-gray-100">
        <button onClick={() => navigate(`/${slug}`)} className="p-2 -ml-2 text-gray-900">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <h2 className="text-xl font-black tracking-tight">Pesanan Saya</h2>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {orders.length === 0 ? (
          <div className="py-20 text-center text-gray-500 font-medium">Belum ada pesanan terdaftar.</div>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} onClick={() => navigate(`/${slug}/orders/${order.id}`)} />
          ))
        )}
      </div>
    </div>
  );
};

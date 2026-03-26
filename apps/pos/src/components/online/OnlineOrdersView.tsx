import React, { useState, useMemo } from 'react';
import { ChevronLeft, RefreshCw, Filter } from 'lucide-react';
import { OnlineOrder, OnlineOrderStatus } from '../../types/online-order';
import OnlineOrderCard from './OnlineOrderCard';
import { useOnlineOrderActions } from '../../hooks/useOnlineOrderActions';
import AssignDriverModal from './AssignDriverModal';
import CancelOrderModal from './CancelOrderModal';

interface OnlineOrdersViewProps {
  orders: OnlineOrder[];
  isLoading: boolean;
  onRefresh: () => void;
  onBack: () => void;
}

type FilterTab = 'new' | 'processing' | 'ready' | 'all';

export default function OnlineOrdersView({
  orders,
  isLoading,
  onRefresh,
  onBack
}: OnlineOrdersViewProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('new');
  const { handleAction, isProcessing } = useOnlineOrderActions(onRefresh);
  
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [modalType, setModalType] = useState<'assign_driver' | 'cancel' | null>(null);

  const onAction = (orderId: string, action: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (action === 'assign_driver') {
      setSelectedOrder(order);
      setModalType('assign_driver');
    } else if (action === 'cancel') {
      setSelectedOrder(order);
      setModalType('cancel');
    } else {
      handleAction(order, action);
    }
  };

  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case 'new':
        return orders.filter(o => o.status === 'Paid');
      case 'processing':
        return orders.filter(o => ['Confirmed', 'Preparing'].includes(o.status));
      case 'ready':
        return orders.filter(o => ['Ready', 'Out for Delivery'].includes(o.status));
      default:
        return orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled');
    }
  }, [orders, activeTab]);

  const stats = {
    new: orders.filter(o => o.status === 'Paid').length,
    processing: orders.filter(o => ['Confirmed', 'Preparing'].includes(o.status)).length,
    ready: orders.filter(o => ['Ready', 'Out for Delivery'].includes(o.status)).length,
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-all"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          <div className="h-6 w-px bg-gray-100 mx-2"></div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-gray-900">Pesanan Online</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manajemen Order Toko</p>
          </div>
        </div>

        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-100 transition-all ${isLoading ? 'opacity-50' : ''}`}
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="px-8 py-6 flex items-center gap-4 bg-white border-b border-gray-100 shadow-sm z-20 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('new')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap
            ${activeTab === 'new' 
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' 
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}
          `}
        >
          🔴 Pesanan Baru ({stats.new})
        </button>
        <button
          onClick={() => setActiveTab('processing')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap
            ${activeTab === 'processing' 
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' 
              : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}
          `}
        >
          🟡 Diproses ({stats.processing})
        </button>
        <button
          onClick={() => setActiveTab('ready')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap
            ${activeTab === 'ready' 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}
          `}
        >
          🟢 Siap / Diantar ({stats.ready})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap
            ${activeTab === 'all' 
              ? 'bg-gray-800 text-white shadow-lg shadow-gray-200' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
          `}
        >
          📋 Semua Aktif
        </button>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-[32px] flex items-center justify-center text-3xl mb-4">
              ✨
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Tidak ada pesanan</h3>
            <p className="text-sm font-bold text-gray-400">Semua pesanan di kategori ini sudah diproses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredOrders.map((order) => (
              <OnlineOrderCard 
                key={order.id} 
                order={order} 
                onAction={onAction}
              />
            ))}
          </div>
        )}
      </div>

      {modalType === 'assign_driver' && selectedOrder && (
        <AssignDriverModal
          order={selectedOrder}
          branchId={selectedOrder.branchId || orders[0]?.branchId || ''}
          onClose={() => setModalType(null)}
          onConfirm={(name, phone, driverId) => {
            handleAction(selectedOrder, 'assign_driver', { driverName: name, driverPhone: phone, driverId });
            setModalType(null);
          }}
        />
      )}

      {modalType === 'cancel' && selectedOrder && (
        <CancelOrderModal 
          order={selectedOrder}
          onClose={() => setModalType(null)}
          onConfirm={(reason) => {
            handleAction(selectedOrder, 'cancel', { reason });
            setModalType(null);
          }}
        />
      )}

      {isProcessing && (
        <div className="fixed inset-0 z-[200] bg-white/20 backdrop-blur-[2px] flex items-center justify-center">
           <div className="bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
              <RefreshCw size={24} className="text-primary animate-spin" />
              <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Memproses...</span>
           </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder } from '../../services/order.api';
import { useStore } from '../../hooks/useStore';
import { OnlineOrder } from '../../types/order';
import { formatRupiah, formatDate } from '../../utils/format';
import { ChevronLeft, MapPin, Package, MessageCircle } from 'lucide-react';
import { StatusTimeline } from './StatusTimeline';
import { Button } from '../ui/Button';
import { generateWhatsAppLink, getOrderWhatsAppMessage } from '../../utils/whatsapp';

import { useOrderTracking } from '../../hooks/useOrderTracking';
import { loadSnapScript, openSnapPopup } from '../../utils/midtrans';
import { MIDTRANS_CLIENT_KEY, MIDTRANS_IS_PRODUCTION } from '../../config/midtrans';
import { motion, AnimatePresence } from 'framer-motion';

export const OrderDetailPage: React.FC = () => {
  const { slug, orderId } = useParams<{ slug: string; orderId: string }>();
  const navigate = useNavigate();
  const { store } = useStore(slug || '');
  const { order, isLoading, error } = useOrderTracking(orderId || '');
  const [isPaying, setIsPaying] = useState(false);

  const handlePayNow = async () => {
    if (!order) return;
    setIsPaying(true);
    try {
      await loadSnapScript(MIDTRANS_CLIENT_KEY, MIDTRANS_IS_PRODUCTION);
      
      // Since order already has snapToken (from useCheckout or re-fetch), we just open it.
      // But we need to make sure order has it. Our API return includes it now.
      if ((order as any).snapToken) {
        openSnapPopup((order as any).snapToken, {
          onSuccess: () => window.location.reload(),
          onPending: () => window.location.reload(),
          onError: () => alert("Pembayaran gagal"),
          onClose: () => setIsPaying(false),
        });
      } else {
        // Fallback or re-fetch token logic here if needed
        alert("Token pembayaran tidak ditemukan. Silakan hubungi toko.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Memuat detail pesanan...</div>;
  if (error || !order) return <div className="p-8 text-center text-gray-900 font-black">Pesanan tidak ditemukan atau terjadi kesalahan</div>;

  const getStatusAction = () => {
    switch (order.status) {
      case 'Pending':
        return (
          <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100 mt-4">
            <p className="text-sm font-bold text-amber-800 mb-4 text-center">Pesanan belum dibayar. Silakan selesaikan pembayaran agar pesanan dapat diproses.</p>
            <Button 
              onClick={handlePayNow} 
              isLoading={isPaying}
              className="w-full bg-amber-500 hover:bg-amber-600 border-none shadow-lg shadow-amber-200"
            >
              Bayar Sekarang
            </Button>
          </div>
        );
      case 'Cancelled':
        return (
          <div className="p-6 bg-red-50 rounded-[32px] border border-red-100 mt-4 text-center">
            <p className="text-sm font-black text-red-700 uppercase tracking-widest mb-1">Pesanan Dibatalkan</p>
            {(order as any).cancelReason && <p className="text-xs text-red-500 font-medium">Alasan: {(order as any).cancelReason}</p>}
          </div>
        );
      case 'Completed':
        return (
          <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-100 mt-4 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-sm font-black text-emerald-700 uppercase tracking-widest">Pesanan Selesai!</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Terima kasih telah memesan di Warung BuJo.</p>
          </div>
        );
      case 'Out for Delivery':
        return (
          <div className="p-6 bg-indigo-50 rounded-[32px] border border-indigo-100 mt-4">
            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3 text-center text-indigo-700/50">🛵 Sedang Diantar</p>
            {(order as any).driverName && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-black text-indigo-400 tracking-widest">Kurir</p>
                  <p className="font-black text-indigo-900">{(order as any).driverName}</p>
                </div>
                {(order as any).driverPhone && (
                  <a 
                    href={generateWhatsAppLink((order as any).driverPhone, `Halo Pak ${(order as any).driverName}, saya menunggu pesanan ${order.orderNumber}`)}
                    target="_blank"
                    className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200"
                  >
                    <MessageCircle size={20} />
                  </a>
                )}
              </div>
            )}
          </div>
        );
      case 'Ready':
        return order.fulfillmentType === 'pickup' ? (
          <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-100 mt-4 text-center">
            <p className="text-sm font-black text-emerald-700 uppercase tracking-widest mb-2">Siap Diambil! 🥡</p>
            <p className="text-xs text-emerald-600 font-medium leading-relaxed">Silakan tunjukkan nomor pesanan ini di kasir.</p>
          </div>
        ) : (
          <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 mt-4 text-center">
            <p className="text-sm font-black text-blue-700 uppercase tracking-widest">Menunggu Kurir... 🛵</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white min-h-screen pb-12">
      <div className="px-4 py-5 flex items-center gap-4 sticky top-0 bg-white z-10 border-b border-gray-100">
        <button onClick={() => navigate(`/${slug}`)} className="p-2 -ml-2 text-gray-900">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <h2 className="text-xl font-black tracking-tight">Detail Pesanan</h2>
      </div>

      <div className="p-5 flex flex-col gap-8">
        {/* Header */}
        <div className="text-center py-6 bg-gray-50 rounded-[32px] border border-gray-100">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{order.orderNumber}</p>
          <h1 className="text-3xl font-black text-gray-900">{formatRupiah(order.total)}</h1>
          <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">{formatDate(order.createdAt)}</p>
        </div>

        {/* Status Actions Banner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={order.status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {getStatusAction()}
          </motion.div>
        </AnimatePresence>

        {/* Timeline */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <Package size={16} /> Status Pesanan
          </h3>
          <StatusTimeline currentStatus={order.status} />
        </div>

        {/* Items */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Daftar Menu</h3>
          <div className="bg-gray-50 rounded-[32px] p-6 space-y-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-sm">
                <div className="flex-1">
                  <p className="text-gray-900 font-bold">{item.qty}x {item.productName}</p>
                  {item.notes && <p className="text-[10px] text-gray-400 italic">"{item.notes}"</p>}
                </div>
                <p className="font-black text-gray-900">{formatRupiah(item.subtotal)}</p>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-200 mt-2 space-y-2">
              <div className="flex justify-between text-xs font-medium text-gray-500">
                <span>Subtotal</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              {Number(order.deliveryFee) > 0 && (
                <div className="flex justify-between text-xs font-medium text-gray-500">
                  <span>Ongkir</span>
                  <span>{formatRupiah(order.deliveryFee)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        {order.fulfillmentType === 'delivery' && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={16} /> Alamat Pengiriman
            </h3>
            <div className="bg-gray-50 rounded-[32px] p-6">
              <p className="text-sm font-bold text-gray-700 leading-relaxed">{order.deliveryAddress}</p>
              {order.deliveryNotes && (
                <p className="text-xs text-gray-400 mt-2 font-medium">Patokan: {order.deliveryNotes}</p>
              )}
            </div>
          </div>
        )}

        {/* Support */}
        <div className="grid grid-cols-1 gap-3">
          <a 
            href={generateWhatsAppLink(store?.whatsappNumber || '', getOrderWhatsAppMessage(order.orderNumber))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="w-full h-14 bg-emerald-50 text-emerald-700 border-none rounded-2xl flex items-center justify-center gap-2">
              <MessageCircle size={20} />
              Chat Toko
            </Button>
          </a>
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/${slug}`)}
            className="w-full text-gray-400 font-bold"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
};

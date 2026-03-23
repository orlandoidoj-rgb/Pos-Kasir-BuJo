import React, { useState } from 'react';
import { OnlineOrder } from '../../types/online-order';
import { X, AlertCircle } from 'lucide-react';

interface CancelOrderModalProps {
  order: OnlineOrder;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const REASONS = [
  'Bahan habis / stok tidak tersedia',
  'Toko sudah tutup / hampir tutup',
  'Alamat pengiriman di luar jangkauan',
  'Toko sedang terlalu ramai',
  'Lainnya'
];

export default function CancelOrderModal({ order, onClose, onConfirm }: CancelOrderModalProps) {
  const [reason, setReason] = useState(REASONS[0]);
  const [detail, setDetail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'Lainnya' ? detail : reason + (detail ? `: ${detail}` : '');
    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <span className="text-2xl">❌</span> Batalkan Pesanan
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100 mb-2">
             <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Pesanan</p>
             <p className="text-sm font-black text-rose-900">{order.orderNumber} · {order.customerName}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Alasan Utama</label>
              <select 
                autoFocus
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-rose-500 transition-all outline-none appearance-none"
              >
                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Detail / Catatan (Opsional)</label>
              <textarea 
                value={detail}
                onChange={e => setDetail(e.target.value)}
                placeholder="Berikan alasan detail untuk pelanggan..."
                className="w-full h-32 bg-gray-50 border-none rounded-2xl p-6 text-sm font-bold focus:ring-2 focus:ring-rose-500 transition-all outline-none resize-none"
              />
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 text-amber-700">
             <AlertCircle size={20} className="shrink-0" />
             <p className="text-[10px] font-bold leading-relaxed">
               Customer akan menerima notifikasi otomatis. Refund untuk pembayaran online harus dilakukan secara manual melalui Dashboard Midtrans.
             </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button 
              type="submit"
              className="w-full h-14 bg-rose-500 text-white rounded-[24px] text-sm font-black uppercase tracking-widest shadow-lg shadow-rose-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Konfirmasi Batalkan
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full h-12 text-gray-400 font-bold hover:text-gray-600 transition-all"
            >
              Kembali
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

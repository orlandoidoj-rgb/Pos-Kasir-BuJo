import React, { useState } from 'react';
import { OnlineOrder } from '../../types/online-order';
import { X, User, Phone, Send } from 'lucide-react';

interface AssignDriverModalProps {
  order: OnlineOrder;
  onClose: () => void;
  onConfirm: (driverName: string, driverPhone: string) => void;
}

export default function AssignDriverModal({ order, onClose, onConfirm }: AssignDriverModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    onConfirm(name, phone);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <span className="text-2xl">🛵</span> Assign Driver
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 mb-2">
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Pesanan</p>
             <p className="text-sm font-black text-indigo-900">{order.orderNumber}</p>
             <p className="text-xs font-bold text-indigo-700 mt-2">{order.deliveryAddress}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Nama Driver</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </div>
                <input 
                  autoFocus
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Contoh: Pak Budi"
                  className="w-full h-14 bg-gray-50 border-none rounded-2xl pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">No. HP Driver (WhatsApp)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Phone size={18} />
                </div>
                <input 
                  required
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full h-14 bg-gray-50 border-none rounded-2xl pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit"
              className="w-full h-14 bg-indigo-500 text-white rounded-[24px] text-sm font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <Send size={18} />
              Kirim & Assign Driver
            </button>
            <p className="text-[10px] text-gray-400 text-center font-bold px-4">
               WhatsApp akan terbuka otomatis untuk mengirim instruksi ke driver setelah konfirmasi.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { OnlineOrder } from '../../types/online-order';
import { X, RefreshCw } from 'lucide-react';
import { onlineApi } from '../../services/online.api';

interface Driver {
  id: string;
  name: string;
  phone: string;
  status: string;
}

interface AssignDriverModalProps {
  order: OnlineOrder;
  branchId: string;
  onClose: () => void;
  onConfirm: (driverName: string, driverPhone: string, driverId?: string) => void;
}

export default function AssignDriverModal({ order, branchId, onClose, onConfirm }: AssignDriverModalProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const data = await onlineApi.getDrivers(branchId);
      setDrivers(data);
    } catch {
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDrivers(); }, [branchId]);

  const handleSelect = (driver: Driver) => {
    if (driver.status === 'busy') return;
    setSelecting(driver.id);
    onConfirm(driver.name, driver.phone, driver.id);
  };

  const statusColor = (status: string) => {
    if (status === 'available') return 'bg-emerald-100 text-emerald-700';
    if (status === 'busy') return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-500';
  };

  const statusLabel = (status: string) => {
    if (status === 'available') return '🟢 Tersedia';
    if (status === 'busy') return '🔴 Sibuk';
    return '⚪ Offline';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <span className="text-2xl">🛵</span> Pilih Driver
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={loadDrivers} className="p-2 text-gray-400 hover:text-gray-700 transition-all">
              <RefreshCw size={18} />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 mb-5">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Pesanan</p>
            <p className="text-sm font-black text-indigo-900">{order.orderNumber}</p>
            <p className="text-xs font-bold text-indigo-700 mt-1">{order.deliveryAddress || 'Pickup'}</p>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-bold">Memuat driver...</p>
            </div>
          ) : drivers.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-2xl mb-2">😔</p>
              <p className="text-sm font-black text-gray-600">Belum ada driver terdaftar</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">Tambah driver melalui backoffice</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {drivers.map(driver => (
                <div
                  key={driver.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    driver.status === 'busy'
                      ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                      : 'bg-white border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 cursor-pointer'
                  }`}
                  onClick={() => handleSelect(driver)}
                >
                  <div>
                    <p className="font-black text-gray-900">{driver.name}</p>
                    <p className="text-xs font-bold text-gray-400 mt-0.5">{driver.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black px-2 py-1 rounded-full ${statusColor(driver.status)}`}>
                      {statusLabel(driver.status)}
                    </span>
                    {driver.status !== 'busy' && (
                      <button
                        disabled={selecting === driver.id}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-60"
                      >
                        {selecting === driver.id ? '...' : 'Pilih'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={onClose} className="w-full mt-5 py-3 text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

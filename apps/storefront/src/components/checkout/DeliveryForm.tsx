import React from 'react';
import { MapPin, MessageCircle } from 'lucide-react';

interface DeliveryFormProps {
  data: { address: string; notes: string };
  onChange: (data: any) => void;
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
      <div className="relative">
        <div className="absolute top-4 left-4">
          <MapPin size={18} className="text-gray-400" />
        </div>
        <textarea
          placeholder="Alamat Pengiriman Lengkap"
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 min-h-[100px]"
        />
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <MessageCircle size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Patokan (Gg. Mawar, sebelah Indomaret, dll)"
          value={data.notes}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
};

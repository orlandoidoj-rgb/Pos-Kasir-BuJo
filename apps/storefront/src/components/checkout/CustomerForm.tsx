import React from 'react';
import { User, Phone, Mail } from 'lucide-react';

interface CustomerFormProps {
  data: { name: string; phone: string; email: string };
  onChange: (data: any) => void;
  disabled?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ data, onChange, disabled }) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Data Pemesan</h3>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <User size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Phone size={18} className="text-gray-400" />
          </div>
          <input
            type="tel"
            placeholder="Nomor WhatsApp (08xxx)"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Mail size={18} className="text-gray-400" />
          </div>
          <input
            type="email"
            placeholder="Alamat Email (untuk invoice)"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>
      </div>
    </div>
  );
};

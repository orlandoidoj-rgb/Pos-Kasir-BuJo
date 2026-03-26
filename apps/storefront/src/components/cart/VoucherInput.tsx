import { useState } from 'react';
import { Tag, Check, X } from 'lucide-react';

interface VoucherInputProps {
  onApply: (code: string) => void;
  onRemove: () => void;
  appliedCode?: string;
  discount?: number;
}

export function VoucherInput({ onApply, onRemove, appliedCode, discount }: VoucherInputProps) {
  const [code, setCode] = useState('');

  return (
    <div className="card p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-secondary">Punya voucher?</span>
      </div>

      {appliedCode ? (
        <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">
              {appliedCode} — Hemat Rp {(discount || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <button 
            onClick={onRemove} 
            className="p-2 -mr-2 text-gray-400 active:scale-90 transition-transform"
            aria-label="Hapus voucher"
          >
            <X className="w-5 h-5 text-emerald-600" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Masukkan kode voucher"
            className="input flex-1 text-sm py-2.5"
            id="voucher-input"
          />
          <button
            onClick={() => { if (code.trim()) onApply(code.trim()); }}
            className="px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform"
            disabled={!code.trim()}
          >
            Pakai
          </button>
        </div>
      )}
    </div>
  );
}

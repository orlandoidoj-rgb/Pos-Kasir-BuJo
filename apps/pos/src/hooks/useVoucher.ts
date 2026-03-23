import { useState } from 'react';
import { validateVoucherLocal } from '../utils';

export function useVoucher(branchId: string, totalAmount: number) {
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState<{code: string; discount: number; message: string} | null>(null);

  const applyVoucher = () => {
    if (!voucherCode.trim()) return;
    const result = validateVoucherLocal(voucherCode, totalAmount, branchId);
    if (result.valid) {
      setVoucherApplied({ code: voucherCode, discount: result.discount, message: result.message });
    } else {
      alert(result.message);
      setVoucherApplied(null);
    }
  };

  const removeVoucher = () => {
    setVoucherApplied(null);
    setVoucherCode('');
  };

  return { 
    voucherCode, setVoucherCode, 
    voucherApplied, setVoucherApplied, 
    applyVoucher, removeVoucher 
  };
}

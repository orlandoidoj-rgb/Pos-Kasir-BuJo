import { useState } from 'react';
import { validateVoucherLocal } from '../utils';

export function useVoucher(branchId: string, totalAmount: number) {
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState<{code: string; discount: number; message: string} | null>(null);
  const [validating, setValidating] = useState(false);

  const applyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setValidating(true);
    try {
      const result = await validateVoucherLocal(voucherCode, totalAmount, branchId);
      if (result.valid) {
        setVoucherApplied({ code: voucherCode, discount: result.discount, message: result.message });
      } else {
        alert(result.message);
        setVoucherApplied(null);
      }
    } catch (error) {
      alert('Gagal validasi voucher. Coba lagi.');
      console.error(error);
    } finally {
      setValidating(false);
    }
  };

  const removeVoucher = () => {
    setVoucherApplied(null);
    setVoucherCode('');
  };

  return {
    voucherCode, setVoucherCode,
    voucherApplied, setVoucherApplied,
    applyVoucher, removeVoucher,
    validating,
  };
}

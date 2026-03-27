// Validate voucher via API
export async function validateVoucherLocal(code: string, orderTotal: number, branchId: string): Promise<{ valid: boolean; discount: number; message: string }> {
  try {
    const res = await fetch('/api/vouchers/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal: orderTotal, branchId }),
    });
    const json = await res.json();
    if (json.success) {
      return {
        valid: json.data.valid,
        discount: json.data.discount || 0,
        message: json.data.message || (json.data.valid ? 'Voucher valid' : 'Voucher tidak valid'),
      };
    }
    return { valid: false, discount: 0, message: 'Error validasi' };
  } catch (error) {
    console.error('Voucher validation error:', error);
    return { valid: false, discount: 0, message: 'Koneksi error' };
  }
}

export function incrementVoucherUsageLocal(code: string) {
  // Usage is tracked on backend, no need for local tracking
  // This function is kept for backward compatibility
  console.log(`Voucher ${code} usage tracked on backend`);
}

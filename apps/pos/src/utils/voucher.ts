export function validateVoucherLocal(code: string, orderTotal: number, branchId: string): { valid: boolean; discount: number; message: string } {
  try {
    const vouchers = JSON.parse(localStorage.getItem('warung_bujo_vouchers') ?? '[]') as Array<{
      id: string; code: string; type: 'fixed'|'percentage'; value: number;
      minOrder: number; maxDiscount: number; expiry: string; usageLimit: number;
      usageCount: number; branchIds: string[]; isActive: boolean;
    }>;
    const all = vouchers.length > 0 ? vouchers : [
      { id:'VCH-001',code:'SELAMAT10',type:'percentage' as const,value:10,minOrder:20000,maxDiscount:15000,expiry:'2026-12-31',usageLimit:100,usageCount:12,branchIds:[],isActive:true },
      { id:'VCH-002',code:'HEMAT5K',type:'fixed' as const,value:5000,minOrder:30000,maxDiscount:0,expiry:'2026-06-30',usageLimit:50,usageCount:8,branchIds:[],isActive:true },
    ];
    const v = all.find(x => x.code.toUpperCase() === code.toUpperCase().trim());
    if (!v) return { valid: false, discount: 0, message: 'Kode tidak ditemukan' };
    if (!v.isActive) return { valid: false, discount: 0, message: 'Voucher tidak aktif' };
    if (new Date(v.expiry) < new Date()) return { valid: false, discount: 0, message: 'Voucher kadaluarsa' };
    if (v.usageLimit > 0 && v.usageCount >= v.usageLimit) return { valid: false, discount: 0, message: 'Kuota habis' };
    if (orderTotal < v.minOrder) return { valid: false, discount: 0, message: `Min. Rp ${v.minOrder.toLocaleString('id-ID')}` };
    if (v.branchIds.length > 0 && !v.branchIds.includes(branchId)) return { valid: false, discount: 0, message: 'Tidak berlaku di cabang ini' };
    const raw = v.type === 'fixed' ? v.value : Math.round(orderTotal * v.value / 100);
    const discount = v.maxDiscount > 0 ? Math.min(raw, v.maxDiscount) : raw;
    return { valid: true, discount, message: `Hemat Rp ${discount.toLocaleString('id-ID')}` };
  } catch { return { valid: false, discount: 0, message: 'Error validasi' }; }
}

export function incrementVoucherUsageLocal(code: string) {
  try {
    const raw = localStorage.getItem('warung_bujo_vouchers');
    if (!raw) return;
    const vouchers = JSON.parse(raw);
    const idx = vouchers.findIndex((v: { code: string }) => v.code.toUpperCase() === code.toUpperCase());
    if (idx >= 0) { vouchers[idx].usageCount += 1; localStorage.setItem('warung_bujo_vouchers', JSON.stringify(vouchers)); }
  } catch { /* ignore */ }
}

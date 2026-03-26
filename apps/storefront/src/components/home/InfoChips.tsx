import { Badge } from '@/components/ui/Badge';
import { Truck, ShieldCheck, Zap } from 'lucide-react';

export function InfoChips() {
  return (
    <div className="px-4 pb-2 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth" id="info-chips">
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
        <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
        <span className="text-[11px] font-bold text-green-700">Higienis</span>
      </div>
      
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-100">
        <Truck className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] font-bold text-primary">Ongkir Murah</span>
      </div>
      
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
        <Zap className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-[11px] font-bold text-blue-700">Pasti Cepat</span>
      </div>

      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-full border border-purple-100">
        <Badge variant="success" size="sm" className="bg-white/50">PROMO</Badge>
        <span className="text-[11px] font-bold text-purple-700">Voucher 50%</span>
      </div>
    </div>
  );
}

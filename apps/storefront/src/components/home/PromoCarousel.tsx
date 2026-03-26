import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export function PromoCarousel() {
  const { showToast } = useToast();
  const promos = [
    { id: 1, title: 'Diskon 50%', sub: 'Khusus Pengguna Baru', color: 'from-orange-500 to-red-500', icon: '🎁', code: 'PROMO50' },
    { id: 2, title: 'Gratis Ongkir', sub: 'Min. Belanja 30rb', color: 'from-blue-500 to-indigo-500', icon: '🛵', code: 'FREEONGKIR' },
    { id: 3, title: 'Flash Sale', sub: 'Mulai Jam 12.00', color: 'from-purple-500 to-pink-500', icon: '⚡', code: 'FLASH12' },
  ];

  return (
    <div className="px-4 py-4 overflow-x-auto no-scrollbar flex gap-4 snap-x" id="promo-carousel">
      {promos.map((promo) => (
        <Card
          key={promo.id}
          noPadding
          className={`relative p-0 flex-shrink-0 w-[280px] h-32 rounded-2xl bg-gradient-to-br ${promo.color} overflow-hidden snap-center border-none shadow-lg`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl rotate-12">
            {promo.icon}
          </div>
          
          <div className="relative p-5 h-full flex flex-col justify-center text-white">
            <h3 className="text-xl font-black mb-1">{promo.title}</h3>
            <p className="text-sm font-medium opacity-90">{promo.sub}</p>
            
            <button 
              onClick={() => showToast(`Voucher ${promo.code} disalin!`)}
              className="mt-3 self-start px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider active:scale-90 transition-transform"
            >
              Klaim Sekarang
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}

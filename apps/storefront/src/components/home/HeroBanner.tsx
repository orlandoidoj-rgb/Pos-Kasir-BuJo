import { StoreInfo } from '@/types/store';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Clock, Star, Info } from 'lucide-react';

interface HeroBannerProps {
  store: StoreInfo;
  isOpen: boolean;
}

export function HeroBanner({ store, isOpen }: HeroBannerProps) {
  const closingTime = getClosingTime(store);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)',
        borderRadius: '0 0 24px 24px',
      }}
      id="hero-banner"
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />
      <div className="absolute top-20 right-8 w-20 h-20 bg-white/5 rounded-full" />

      <div className="relative px-5 pt-16 pb-8">
        {/* Store logo/icon */}
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg">
          {store.logoImage ? (
            <img src={store.logoImage} alt={store.storeName} className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <span className="text-3xl">🍽️</span>
          )}
        </div>

        {/* Store name */}
        <h1 className="text-2xl font-extrabold text-white mb-1 tracking-tight">
          {store.storeName}
        </h1>
        <p className="text-white/70 text-sm font-medium mb-4">
          {store.description || store.slug.replace(/-/g, ' ')}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-white/90 text-sm mb-3 flex-wrap">
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
            <span className="font-semibold">4.8</span>
          </span>
          {store.estimatedPrepTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{store.estimatedPrepTime} min</span>
            </span>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start gap-1.5 text-white/70 text-xs mb-4">
          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Jl. Borobudur No. 22, Malang</span>
        </div>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm">
          <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-green-400 animate-pulse-dot' : 'bg-red-400'}`} />
          <span className="text-white text-xs font-semibold">
            {isOpen
              ? `BUKA ${closingTime ? `sampai ${closingTime}` : ''}`
              : 'TUTUP'
            }
          </span>
        </div>
      </div>
    </div>
  );
}

function getClosingTime(store: StoreInfo): string | null {
  if (!store.operatingHours) return null;
  const now = new Date();
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const today = days[now.getDay()];
  const hours = store.operatingHours[today];
  return hours?.close || null;
}

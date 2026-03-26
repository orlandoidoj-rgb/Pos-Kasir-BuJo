import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { MapPin, Utensils, ChevronRight } from 'lucide-react';
import { ProductList } from '@/components/menu/ProductList';
import { ProductDetail } from '@/components/menu/ProductDetail';
import { BottomCartBar } from '@/components/layout/BottomCartBar';
import { WhatsAppFab } from '@/components/ui/WhatsAppFab';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { MenuItem } from '@/types/product';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)',
      }}
      id="landing-page"
    >
      {/* Decorative circles */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/5 rounded-full" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
      <div className="absolute top-1/3 right-4 w-24 h-24 bg-white/5 rounded-full" />

      <div className="relative z-10 max-w-sm">
        {/* Logo */}
        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Utensils className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          WARUNG BUJO
        </h1>
        <p className="text-white/70 text-base font-medium mb-8">
          Pesan makanan favoritmu dengan mudah
        </p>

        {/* CTA */}
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => navigate('/malang-pusat')}
          className="!bg-white !text-primary !border-0 !shadow-xl"
          id="start-btn"
        >
          <span className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Mulai Pesan
            <ChevronRight className="w-5 h-5" />
          </span>
        </Button>

        <p className="text-white/50 text-xs mt-6">
          © 2026 Warung BuJo. Semua hak dilindungi.
        </p>
      </div>
    </div>
  );
}

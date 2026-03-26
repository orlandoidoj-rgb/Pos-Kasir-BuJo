import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { request } from '@/services/api';
import { getItem, removeItem } from '@/utils/storage';
import { formatRupiah } from '@/utils/format';
import { User, LogOut, Star, Gift, Tag, ShoppingBag, CreditCard, ChevronRight } from 'lucide-react';

interface SyncData {
  profile: {
    id: string;
    fullName: string;
    phoneNumber: string | null;
    email: string | null;
    points: number;
    createdAt: string;
  };
  points: number;
  vouchers: {
    id: string;
    isUsed: boolean;
    claimedAt: string;
    promo: {
      id: string;
      code: string;
      title: string;
      description: string | null;
      discountType: string;
      value: string;
      minOrder: string;
      maxDiscount: string;
      validUntil: string | null;
    };
  }[];
}

export function MyAccountPage() {
  const navigate = useNavigate();
  const token = getItem<string>('warung_bujo_token', '');
  const [data, setData] = useState<SyncData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    request<SyncData>('/api/customer/sync', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = () => {
    removeItem('warung_bujo_token');
    removeItem('warung_bujo_customer');
    removeItem('warung_bujo_user');
    navigate('/');
  };

  if (!token || (!loading && !data)) {
    return (
      <div className="min-h-screen bg-bg-gray">
        <Header title="Akun Saya" showBack showCart={false} showSearch={false} />
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-lg font-bold text-secondary mb-2">Belum Login</h2>
          <p className="text-gray-400 text-sm mb-6">Login untuk melihat akun kamu</p>
          <Button onClick={() => navigate('/login')}>Masuk</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-gray">
        <Header title="Akun Saya" showBack showCart={false} showSearch={false} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const profile = data!.profile;
  const vouchers = data!.vouchers;

  return (
    <div className="min-h-screen bg-bg-gray pb-8" id="my-account-page">
      <Header title="Akun Saya" showBack showCart={false} showSearch={false} />

      {/* Profile Card */}
      <div className="px-4 -mt-2">
        <div
          className="rounded-2xl p-5 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />

          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shrink-0">
              <span className="text-2xl font-bold">{profile.fullName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate">{profile.fullName}</h2>
              {profile.phoneNumber && (
                <p className="text-white/70 text-sm">{profile.phoneNumber.startsWith('62') ? '0' + profile.phoneNumber.slice(2) : profile.phoneNumber}</p>
              )}
              {profile.email && <p className="text-white/60 text-xs">{profile.email}</p>}
            </div>
          </div>

          {/* Points */}
          <div className="relative mt-4 flex items-center gap-2 bg-white/15 rounded-xl p-3">
            <Star className="w-6 h-6 text-yellow-300" fill="currentColor" />
            <div>
              <p className="text-xs text-white/70 font-medium">Poin Loyalti</p>
              <p className="text-xl font-black">{profile.points.toLocaleString('id-ID')} <span className="text-sm font-medium text-white/70">poin</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Vouchers */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-secondary flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            Voucher Tersedia
          </h3>
          <span className="text-xs text-gray-400 font-medium">{vouchers.length} voucher</span>
        </div>

        {vouchers.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center py-6 text-center">
              <Tag className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm font-medium">Belum ada voucher tersedia</p>
              <p className="text-gray-300 text-xs mt-1">Kumpulkan poin untuk mendapat voucher!</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {vouchers.map(v => {
              const isPercentage = v.promo.discountType === 'percentage';
              return (
                <Card key={v.id}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isPercentage ? 'bg-indigo-50' : 'bg-emerald-50'
                    }`}>
                      <Tag className={`w-5 h-5 ${isPercentage ? 'text-indigo-500' : 'text-emerald-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-secondary text-sm truncate">{v.promo.title}</p>
                      <p className="text-xs text-gray-400 font-mono">{v.promo.code}</p>
                      <p className="text-xs text-primary font-bold mt-0.5">
                        {isPercentage
                          ? `Diskon ${v.promo.value}%${Number(v.promo.maxDiscount) > 0 ? ` (maks ${formatRupiah(Number(v.promo.maxDiscount))})` : ''}`
                          : `Potongan ${formatRupiah(Number(v.promo.value))}`
                        }
                      </p>
                    </div>
                    {v.promo.validUntil && (
                      <p className="text-[10px] text-gray-400 shrink-0">
                        s/d {new Date(v.promo.validUntil).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="px-4 mt-5 space-y-2">
        <button
          onClick={() => navigate(-1)}
          className="w-full bg-white rounded-xl border border-card-border p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-all"
        >
          <ShoppingBag className="w-5 h-5 text-primary" />
          <span className="flex-1 text-sm font-semibold text-secondary">Riwayat Pesanan</span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      {/* Logout */}
      <div className="px-4 mt-5">
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-xl border border-card-border p-4 flex items-center justify-center gap-2 text-red-500 font-semibold text-sm active:scale-95 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

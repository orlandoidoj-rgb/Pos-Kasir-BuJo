import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { request } from '@/services/api';
import { setItem } from '@/utils/storage';

export function LoginPage() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) { setError('Nomor HP wajib diisi'); return; }
    if (!password) { setError('Password wajib diisi'); return; }

    setLoading(true);
    setError('');
    try {
      const data: any = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: phoneNumber.trim(), password }),
      });
      setItem('warung_bujo_token', data.token);
      setItem('warung_bujo_customer', data.user.id);
      setItem('warung_bujo_user', JSON.stringify(data.user));
      navigate(-1);
    } catch (err: any) {
      setError(err.message || 'Gagal login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Integrate actual Google Sign-In SDK
    // For now, this would trigger the Google OAuth flow
    setError('Google Sign-In sedang dalam pengembangan');
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-white" id="login-page">
      {/* Hero section */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)',
          minHeight: '30vh',
        }}
      >
        {/* Decorative */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute top-1/4 right-10 w-20 h-20 bg-white/5 rounded-full" />

        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-5 shadow-lg">
            <span className="text-4xl">🍽️</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">WARUNG BUJO</h1>
          <p className="text-white/70 text-sm font-medium mt-2">Online Store</p>
        </div>
      </div>

      {/* Login form */}
      <div className="px-8 py-8 -mt-6 bg-white rounded-t-3xl relative z-10">
        <h2 className="text-lg font-bold text-secondary mb-1">Masuk ke akunmu</h2>
        <p className="text-sm text-gray-400 mb-6">Pesan makanan favoritmu dengan mudah!</p>

        <form onSubmit={handlePhoneLogin} className="space-y-4">
          {/* Phone Number */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Nomor HP</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => { setPhoneNumber(e.target.value); setError(''); }}
              placeholder="08xxx atau 628xxx"
              autoFocus
              className="input text-sm focus:ring-2 focus:ring-primary/20 transition-all w-full"
              id="login-phone-input"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Masukkan password"
              className="input text-sm focus:ring-2 focus:ring-primary/20 transition-all w-full"
              id="login-password-input"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600 font-semibold text-center">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button type="submit" fullWidth loading={loading} id="login-submit-btn">
            Masuk
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">atau</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl border-2 border-gray-200 bg-white font-semibold text-secondary text-sm active:bg-gray-50 active:scale-[0.98] transition-all"
          id="google-signin-btn"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Lanjutkan dengan Google
        </button>

        {/* Register link */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Belum punya akun?{' '}
          <button onClick={() => navigate('/register')} className="text-primary font-bold">
            Daftar sekarang
          </button>
        </p>

        {/* Skip */}
        <Button
          variant="ghost"
          fullWidth
          onClick={() => navigate(-1)}
          className="mt-3"
          id="skip-login-btn"
        >
          Lanjut tanpa login
        </Button>

        {/* Terms */}
        <p className="text-[11px] text-gray-400 text-center mt-6">
          Dengan masuk, Anda setuju dengan{' '}
          <span className="text-primary font-medium">Syarat & Ketentuan</span>{' '}
          kami
        </p>
      </div>
    </div>
  );
}

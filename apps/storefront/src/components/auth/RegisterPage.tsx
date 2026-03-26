import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { request } from '@/services/api';
import { setItem } from '@/utils/storage';

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phoneNumber: '', fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.phoneNumber.trim()) { setError('Nomor HP wajib diisi'); return; }
    if (!form.fullName.trim()) { setError('Nama lengkap wajib diisi'); return; }
    if (!form.password || form.password.length < 6) { setError('Password minimal 6 karakter'); return; }

    setLoading(true);
    try {
      const data: any = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: form.phoneNumber.trim(),
          fullName: form.fullName.trim(),
          email: form.email.trim() || undefined,
          password: form.password,
        }),
      });
      setItem('warung_bujo_token', data.token);
      setItem('warung_bujo_customer', data.user.id);
      setItem('warung_bujo_user', JSON.stringify(data.user));
      navigate(-1);
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-white" id="register-page">
      {/* Hero */}
      <div
        className="flex flex-col items-center justify-center px-8 text-center relative overflow-hidden py-12"
        style={{
          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)',
        }}
      >
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />

        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🍽️</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Buat Akun Baru</h1>
          <p className="text-white/70 text-sm font-medium mt-1">Daftar untuk mulai memesan</p>
        </div>
      </div>

      {/* Form */}
      <div className="px-8 py-8 -mt-4 bg-white rounded-t-3xl relative z-10 flex-1">
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Phone */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Nomor HP <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={e => { setForm(f => ({ ...f, phoneNumber: e.target.value })); setError(''); }}
              placeholder="08xxx atau 628xxx"
              autoFocus
              className="input text-sm focus:ring-2 focus:ring-primary/20 transition-all w-full"
              id="register-phone-input"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={e => { setForm(f => ({ ...f, fullName: e.target.value })); setError(''); }}
              placeholder="Nama tampilan kamu"
              className="input text-sm focus:ring-2 focus:ring-primary/20 transition-all w-full"
              id="register-name-input"
            />
          </div>

          {/* Email (optional) */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Email <span className="text-gray-300">(Opsional)</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="email@contoh.com"
              className="input text-sm focus:ring-2 focus:ring-primary/20 transition-all w-full"
              id="register-email-input"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError(''); }}
              placeholder="Minimal 6 karakter"
              className="input text-sm focus:ring-2 focus:ring-primary/20 transition-all w-full"
              id="register-password-input"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600 font-semibold text-center">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button type="submit" fullWidth loading={loading} id="register-submit-btn">
            Daftar Sekarang
          </Button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <button onClick={() => navigate('/login')} className="text-primary font-bold">
            Masuk di sini
          </button>
        </p>
      </div>
    </div>
  );
}

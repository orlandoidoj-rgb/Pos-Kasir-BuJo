import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { request } from '@/services/api';
import { setItem } from '@/utils/storage';

export function CompleteProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressNote, setAddressNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get user data from location state or storage
  useEffect(() => {
    const state = location.state as any;
    if (state?.user) {
      setName(state.user.name || state.user.fullName || '');
      setEmail(state.user.email || '');
      setPhone(state.user.phoneNumber || '');
    } else {
      const userStr = localStorage.getItem('warung_bujo_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setName(user.name || user.fullName || '');
        setEmail(user.email || '');
        setPhone(user.phoneNumber || '');
      } else {
        navigate('/login');
      }
    }
  }, [location, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Nama lengkap wajib diisi'); return; }
    if (!phone.trim()) { setError('Nomor HP wajib diisi'); return; }

    setLoading(true);
    try {
      // Update user profile via API
      const token = localStorage.getItem('warung_bujo_token');
      const data: any = await request('/api/customer/me', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          fullName: name.trim(),
          phoneNumber: phone.trim(),
          address: address.trim(),
          addressNote: addressNote.trim(),
        }),
      });

      // Update local storage
      const currentUser = JSON.parse(localStorage.getItem('warung_bujo_user') || '{}');
      localStorage.setItem('warung_bujo_user', JSON.stringify({ ...currentUser, ...data.user }));

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-white" id="complete-profile-page">
      {/* Hero */}
      <div
        className="flex flex-col items-center justify-center px-8 text-center relative overflow-hidden py-10"
        style={{
          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)',
        }}
      >
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />

        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">👤</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Lengkapi Profil Anda</h1>
          <p className="text-white/70 text-sm font-medium mt-1">{email || name}</p>
        </div>
      </div>

      {/* Form */}
      <div className="px-8 py-8 -mt-4 bg-white rounded-t-3xl relative z-10 flex-1">
        <form onSubmit={handleSave} className="space-y-4">
          {/* Name */}
          <div>
            <Input
              label="Nama Lengkap"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="Nama tampilan kamu"
              id="complete-name-input"
            />
          </div>

          {/* Email (read-only if from Google) */}
          {email && (
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500"
                id="complete-email-input"
              />
            </div>
          )}

          {/* Phone */}
          <div>
            <Input
              label="No. WhatsApp"
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setError(''); }}
              placeholder="08xxx atau 628xxx"
              id="complete-phone-input"
            />
            <p className="text-xs text-gray-400 mt-1">Wajib diisi untuk notifikasi pesanan</p>
          </div>

          {/* Address */}
          <div>
            <Input
              label="Alamat Pengiriman"
              isTextArea
              value={address}
              onChange={e => { setAddress(e.target.value); setError(''); }}
              placeholder="Alamat lengkap untuk pengiriman"
              id="complete-address-input"
            />
          </div>

          {/* Address Note */}
          <div>
            <Input
              label="Patokan"
              value={addressNote}
              onChange={e => { setAddressNote(e.target.value); setError(''); }}
              placeholder="Sebelah warung biru, depan masjid, dll"
              id="complete-note-input"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600 font-semibold text-center">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button type="submit" fullWidth loading={loading} id="complete-submit-btn">
            Simpan & Lanjut Belanja
          </Button>
        </form>

        {/* Terms */}
        <p className="text-[11px] text-gray-400 text-center mt-6">
          Data pribadi Anda aman dan digunakan untuk pengiriman pesanan
        </p>
      </div>
    </div>
  );
}

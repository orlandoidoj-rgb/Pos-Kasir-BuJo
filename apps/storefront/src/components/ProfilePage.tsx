import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, User, Phone, MapPin, FileText } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/malang-pusat';

  const customerId = localStorage.getItem('customer_id');
  const customerName = localStorage.getItem('customer_name') || '';
  const customerEmail = localStorage.getItem('customer_email') || '';
  const customerAvatar = localStorage.getItem('customer_avatar');
  const token = localStorage.getItem('customer_token');

  const [form, setForm] = useState({
    name: customerName,
    phone: '',
    address: '',
    addressNote: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!customerId) { navigate('/login'); return; }

    // Load existing profile
    fetch(`${API_BASE_URL}/online/customer/${customerId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          const c = data.data;
          setForm({
            name: c.name || customerName,
            phone: c.phone?.startsWith('google_') ? '' : (c.phone || ''),
            address: c.address || '',
            addressNote: c.addressNote || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, [customerId, navigate, customerName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone) { alert('Nomor HP wajib diisi'); return; }
    if (!customerId || !token) { navigate('/login'); return; }

    setLoading(true);
    try {
      // 1. Update address
      const res = await fetch(`${API_BASE_URL}/online/customer/${customerId}/address`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ address: form.address, addressNote: form.addressNote }),
      });
      if (!res.ok) throw new Error('Gagal update profil');

      // 2. If phone changed (was google_xxx), update via register endpoint
      if (form.phone) {
        await fetch(`${API_BASE_URL}/online/customer/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, phone: form.phone, email: customerEmail }),
        });
      }

      localStorage.setItem('customer_name', form.name);
      navigate(redirect);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Keluar dari akun?')) {
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_id');
      localStorage.removeItem('customer_name');
      localStorage.removeItem('customer_email');
      localStorage.removeItem('customer_avatar');
      navigate('/malang-pusat');
    }
  };

  if (loadingProfile) {
    return <div className="p-8 text-center font-bold text-gray-400 animate-pulse">Memuat profil...</div>;
  }

  return (
    <div className="bg-white min-h-screen pb-12 max-w-md mx-auto">
      <div className="px-4 py-5 flex items-center gap-4 sticky top-0 bg-white z-10 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <h2 className="text-xl font-black tracking-tight flex-1">Profil Saya</h2>
        <button onClick={handleLogout} className="text-xs text-red-500 font-bold px-3 py-2 rounded-xl hover:bg-red-50 transition-all">
          Keluar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-8">
        {/* Avatar */}
        <div className="flex flex-col items-center py-4">
          {customerAvatar ? (
            <img src={customerAvatar} alt={customerName} className="w-20 h-20 rounded-full object-cover mb-3" />
          ) : (
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <User size={36} className="text-primary" />
            </div>
          )}
          <p className="font-black text-gray-900 text-lg">{form.name}</p>
          <p className="text-sm text-gray-500 font-medium">{customerEmail}</p>
        </div>

        {/* Nama */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <User size={12} /> Nama Lengkap
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full h-14 bg-gray-50 rounded-2xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            placeholder="Nama kamu"
          />
        </div>

        {/* No HP */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Phone size={12} /> No. HP (WhatsApp)
          </label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="w-full h-14 bg-gray-50 rounded-2xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            placeholder="08xxx / 628xxx"
          />
          <p className="text-xs text-gray-400 font-medium px-1">Digunakan untuk update status pesanan via WhatsApp</p>
        </div>

        {/* Alamat */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={12} /> Alamat Pengiriman
          </label>
          <textarea
            rows={3}
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            className="w-full bg-gray-50 rounded-2xl px-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
            placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan"
          />
        </div>

        {/* Patokan */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <FileText size={12} /> Patokan Alamat
          </label>
          <input
            type="text"
            value={form.addressNote}
            onChange={e => setForm(f => ({ ...f, addressNote: e.target.value }))}
            className="w-full h-14 bg-gray-50 rounded-2xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            placeholder="Contoh: Sebelah warung biru, depan masjid"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-primary text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? 'Menyimpan...' : 'Simpan Profil'}
        </button>
      </form>
    </div>
  );
};

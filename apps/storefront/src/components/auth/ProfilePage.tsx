import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { getCustomerProfile, updateCustomerAddress } from '@/services/customer.api';
import { Customer } from '@/types/customer';
import { getItem, removeItem } from '@/utils/storage';
import { formatRupiah } from '@/utils/format';
import { User, LogOut, ShoppingBag, CreditCard } from 'lucide-react';

export function ProfilePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const customerId = getItem<string>('warung_bujo_customer', '');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressNote, setAddressNote] = useState('');

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }
    getCustomerProfile(customerId)
      .then(c => {
        setCustomer(c);
        setName(c.name);
        setPhone(c.phone);
        setAddress(c.address || '');
        setAddressNote(c.addressNote || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [customerId]);

  const handleSave = async () => {
    if (!customerId) return;
    setSaving(true);
    try {
      await updateCustomerAddress(customerId, address, addressNote);
      showToast('Profil berhasil disimpan!');
    } catch {
      showToast('Gagal menyimpan profil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    removeItem('warung_bujo_customer');
    showToast('Berhasil logout');
    navigate('/');
  };

  if (!customerId || !customer) {
    return (
      <div className="min-h-screen bg-bg-gray">
        <Header title="Profil Saya" showBack showCart={false} showSearch={false} />
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-lg font-bold text-secondary mb-2">Belum Login</h2>
          <p className="text-gray-400 text-sm mb-6">Login untuk melihat profil kamu</p>
          <Button onClick={() => navigate('/login')}>Masuk</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-gray pb-8" id="profile-page">
      <Header title="Profil Saya" showBack showCart={false} showSearch={false} />

      {/* Avatar section */}
      <div className="flex flex-col items-center py-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-btn mb-3">
          <span className="text-3xl text-white font-bold">{name.charAt(0).toUpperCase()}</span>
        </div>
        <h2 className="text-lg font-bold text-secondary">{customer.name}</h2>
        <p className="text-sm text-gray-400">{customer.email}</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Info form */}
        <Card>
          <h3 className="text-sm font-semibold text-secondary mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Informasi Pengiriman
          </h3>
          <div className="space-y-3">
            <Input label="Nama Lengkap" value={name} onChange={e => setName(e.target.value)} />
            <Input label="No. WhatsApp" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
            <Input label="Alamat Lengkap" isTextArea value={address} onChange={e => setAddress(e.target.value)} />
            <Input label="Patokan" value={addressNote} onChange={e => setAddressNote(e.target.value)} placeholder="Sebelah warung biru" />
            <Button fullWidth onClick={handleSave} loading={saving}>Simpan Profil</Button>
          </div>
        </Card>

        {/* Order stats */}
        <Card>
          <h3 className="text-sm font-semibold text-secondary mb-3">Pesanan</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary-50 rounded-xl p-3 text-center">
              <ShoppingBag className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-secondary">{customer.totalOrders}</p>
              <p className="text-[11px] text-gray-500">Total Pesanan</p>
            </div>
            <div className="bg-primary-50 rounded-xl p-3 text-center">
              <CreditCard className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-secondary">{formatRupiah(customer.totalSpent)}</p>
              <p className="text-[11px] text-gray-500">Total Belanja</p>
            </div>
          </div>
        </Card>

        {/* Logout */}
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

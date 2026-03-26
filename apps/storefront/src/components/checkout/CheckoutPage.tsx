import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { CartSummary } from '@/components/cart/CartSummary';
import { useCartContext, useStoreContext } from '@/components/layout/MobileLayout';
import { useToast } from '@/components/ui/Toast';
import { checkout } from '@/services/order.api';
import { payWithSnap } from '@/utils/midtrans';
import { formatRupiah } from '@/utils/format';
import { getItem } from '@/utils/storage';
import { request } from '@/services/api';
import { Store, Truck, MapPin, User, StickyNote, CreditCard, Tag, ChevronDown, X } from 'lucide-react';

export function CheckoutPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { items, subtotal, itemCount, clearCart } = useCartContext();
  const { store } = useStoreContext();
  const { showToast } = useToast();

  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [addressNote, setAddressNote] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const deliveryFee = fulfillment === 'delivery' ? (store?.deliveryFee || 10000) : 0;
  const total = subtotal + deliveryFee;

  // ─── Voucher selection ──────────────────────────────────────────────
  const token = getItem<string>('warung_bujo_token', '');
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const [showVoucherPicker, setShowVoucherPicker] = useState(false);

  useEffect(() => {
    if (!token) return;
    request<any>('/api/customer/sync', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(data => setVouchers(data.vouchers || []))
      .catch(() => {});
  }, [token]);

  // Calculate discount from selected voucher
  const voucherDiscount = selectedVoucher
    ? selectedVoucher.promo.discountType === 'percentage'
      ? Math.min(
          Math.round(subtotal * Number(selectedVoucher.promo.value) / 100),
          Number(selectedVoucher.promo.maxDiscount) > 0 ? Number(selectedVoucher.promo.maxDiscount) : Infinity
        )
      : Number(selectedVoucher.promo.value)
    : 0;
  const finalTotal = Math.max(0, total - voucherDiscount);

  const canCheckout = name.trim() && phone.trim() && (fulfillment === 'pickup' || address.trim());

  const handleCheckout = async () => {
    if (!slug || !canCheckout) return;
    setLoading(true);

    try {
      const result = await checkout(slug, {
        name,
        phone,
        email,
        source: 'ONLINE_STORE',
        fulfillmentType: fulfillment,
        deliveryAddress: fulfillment === 'delivery' ? address : undefined,
        deliveryNotes: fulfillment === 'delivery' ? addressNote : undefined,
        customerNotes: customerNotes || undefined,
        lines: items.map(item => ({
          productId: item.id,
          qty: item.qty,
          notes: item.notes,
        })),
      });

      // Backend now bypasses Midtrans and returns 201 directly
      clearCart();
      showToast('Pesanan berhasil dibuat! 🎉');
      navigate(`/${slug}/orders/${result.orderId}`);
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-28" id="checkout-page">
      <Header title="Checkout" showBack showCart={false} showSearch={false} />

      <div className="px-4 mt-4 space-y-4">
        {/* Fulfillment Toggle */}
        <Card>
          <h3 className="text-sm font-semibold text-secondary mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            Pengiriman
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setFulfillment('pickup')}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                fulfillment === 'pickup'
                  ? 'bg-primary text-white shadow-btn'
                  : 'bg-gray-50 text-gray-500 border border-gray-200'
              }`}
            >
              🏪 Ambil Sendiri
            </button>
            <button
              onClick={() => setFulfillment('delivery')}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                fulfillment === 'delivery'
                  ? 'bg-primary text-white shadow-btn'
                  : 'bg-gray-50 text-gray-500 border border-gray-200'
              }`}
              disabled={!store?.deliveryEnabled}
            >
              🛵 Antar
            </button>
          </div>

          {fulfillment === 'delivery' && (
            <div className="mt-4 space-y-3">
              <Input
                label="Alamat Pengiriman *"
                isTextArea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Borobudur No. 5, Kec. Lowokwaru, Malang"
                id="address-input"
              />
              <Input
                label="Patokan"
                value={addressNote}
                onChange={(e) => setAddressNote(e.target.value)}
                placeholder="Sebelah warung biru"
              />
            </div>
          )}
        </Card>

        {/* Customer Info */}
        <Card>
          <h3 className="text-sm font-semibold text-secondary mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Data Pemesan
          </h3>
          <div className="space-y-3">
            <Input
              label="Nama Lengkap *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
              id="name-input"
            />
            <Input
              label="No. WhatsApp *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xx-xxxx-xxxx"
              type="tel"
              id="phone-input"
            />
            <Input
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@gmail.com"
              type="email"
              id="email-input"
            />
          </div>
        </Card>

        {/* Order items */}
        <Card>
          <h3 className="text-sm font-semibold text-secondary mb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" />
            Pesanan
          </h3>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.qty}x {item.name}
                </span>
                <span className="text-secondary font-medium">
                  {formatRupiah(Number(item.price) * item.qty)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <h3 className="text-sm font-semibold text-secondary mb-3 flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-primary" />
            Catatan
          </h3>
          <Input
            isTextArea
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="Catatan untuk toko..."
          />
        </Card>

        {/* Payment Summary */}
        <CartSummary
          itemCount={itemCount}
          subtotal={subtotal}
          deliveryFee={fulfillment === 'delivery' ? deliveryFee : undefined}
        />

        {/* Payment Method */}
        <Card>
          <h3 className="text-sm font-semibold text-secondary mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Metode Pembayaran
          </h3>
          <p className="text-sm text-gray-500">
            Pesanan akan dibayar secara tunai (Cash/COD) saat makanan diterima atau diambil.
          </p>
        </Card>

        {/* Voucher Selection */}
        {token && (
          <Card>
            <h3 className="text-sm font-semibold text-secondary mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Voucher
            </h3>
            {selectedVoucher ? (
              <div className="flex items-center gap-3 bg-primary-50 rounded-xl p-3">
                <Tag className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-secondary truncate">{selectedVoucher.promo.title}</p>
                  <p className="text-xs text-primary font-semibold">Hemat {formatRupiah(voucherDiscount)}</p>
                </div>
                <button onClick={() => setSelectedVoucher(null)} className="p-1.5 rounded-lg hover:bg-white/60 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : vouchers.length > 0 ? (
              <button
                onClick={() => setShowVoucherPicker(!showVoucherPicker)}
                className="w-full p-3 border-2 border-dashed border-primary/30 rounded-xl text-sm text-primary font-semibold hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
              >
                <Tag className="w-4 h-4" />
                Pilih Voucher ({vouchers.length} tersedia)
              </button>
            ) : (
              <p className="text-sm text-gray-400">Login untuk menggunakan voucher</p>
            )}

            {showVoucherPicker && !selectedVoucher && (
              <div className="mt-3 space-y-2">
                {vouchers.map(v => {
                  const minOrder = Number(v.promo.minOrder) || 0;
                  const eligible = subtotal >= minOrder;
                  return (
                    <button
                      key={v.id}
                      onClick={() => { if (eligible) { setSelectedVoucher(v); setShowVoucherPicker(false); } }}
                      disabled={!eligible}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        eligible
                          ? 'border-gray-200 hover:border-primary hover:bg-primary-50'
                          : 'border-gray-100 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <p className="text-sm font-bold text-secondary">{v.promo.title}</p>
                      <p className="text-xs text-gray-500 font-mono">{v.promo.code}</p>
                      {!eligible && (
                        <p className="text-[10px] text-red-400 mt-1">Min. order {formatRupiah(minOrder)}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Pay button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40">
        <div className="max-w-lg mx-auto">
          <Button
            fullWidth
            size="lg"
            onClick={handleCheckout}
            loading={loading}
            disabled={!canCheckout}
            id="pay-btn"
          >
            Bayar {formatRupiah(finalTotal)} →
          </Button>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            Dengan memesan, Anda setuju dengan syarat & ketentuan kami
          </p>
        </div>
      </div>
    </div>
  );
}

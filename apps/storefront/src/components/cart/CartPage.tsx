import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { CartItem } from '@/components/cart/CartItem';
import { VoucherInput } from '@/components/cart/VoucherInput';
import { CartSummary } from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCartContext, useStoreContext } from '@/components/layout/MobileLayout';
import { useToast } from '@/components/ui/Toast';
import { formatRupiah } from '@/utils/format';
import { Store, ShoppingBag, ChevronRight } from 'lucide-react';

export function CartPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { items, updateQty, removeItem, subtotal, itemCount } = useCartContext();
  const { store } = useStoreContext();
  const { showToast } = useToast();
  const [voucher, setVoucher] = useState<{ code: string; discount: number } | null>(null);

  const handleVoucherApply = (code: string) => {
    // Simple voucher simulation
    if (code === 'DISKON20' || code === 'BUJO20') {
      const discount = Math.min(subtotal * 0.2, 10000);
      setVoucher({ code, discount });
      showToast(`Voucher ${code} berhasil dipakai!`);
    } else {
      showToast('Kode voucher tidak valid', 'error');
    }
  };

  if (items.length === 0) {
    return (
      <div>
        <Header title="Keranjang" showBack showCart={false} showSearch={false} />
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
          <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-4">
            <ShoppingBag className="w-12 h-12 text-primary/40" />
          </div>
          <h2 className="text-lg font-bold text-secondary mb-2">Keranjang Kosong</h2>
          <p className="text-gray-400 text-sm mb-6">Yuk, pilih menu favoritmu!</p>
          <Button onClick={() => navigate(`/${slug}`)}>
            Lihat Menu
          </Button>
        </div>
      </div>
    );
  }

  const total = subtotal - (voucher?.discount || 0);

  return (
    <div className="pb-28" id="cart-page">
      <Header
        title={`Keranjang (${itemCount})`}
        showBack
        showCart={false}
        showSearch={false}
      />

      <div className="px-4 mt-4">
        {/* Recommendation card */}
        <Card className="bg-orange-50 border-orange-100 p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl">
              🎁
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-secondary">Mau nambah lagi?</p>
              <p className="text-[11px] text-gray-500">Beli 1 lagi untuk dapatkan diskon 10%!</p>
            </div>
            <button 
              onClick={() => navigate(`/${slug}`)}
              className="text-xs font-bold text-primary px-2 py-1 -mr-2 active:scale-95 transition-transform"
            >
              Lihat Menu
            </button>
          </div>
        </Card>

        {/* Store info mini */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Store className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-secondary">
            {store?.storeName || 'Warung BuJo'}
          </span>
        </div>

        {/* Cart Items */}
        <div className="card p-4">
          {items.map((item, idx) => (
            <CartItem
              key={`${item.id}-${item.notes || ''}-${idx}`}
              item={item}
              onUpdateQty={(delta) => updateQty(item.id, delta, item.notes)}
              onRemove={() => {
                removeItem(item.id, item.notes);
                showToast(`${item.name} dihapus dari keranjang`);
              }}
            />
          ))}
        </div>

        {/* Voucher */}
        <VoucherInput
          onApply={handleVoucherApply}
          onRemove={() => setVoucher(null)}
          appliedCode={voucher?.code}
          discount={voucher?.discount}
        />

        {/* Summary */}
        <CartSummary
          itemCount={itemCount}
          subtotal={subtotal}
          discount={voucher?.discount}
        />
      </div>

      {/* Checkout button fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40">
        <div className="max-w-lg mx-auto">
          <Button
            fullWidth
            size="lg"
            onClick={() => navigate(`/${slug}/checkout`)}
            id="checkout-btn"
          >
            Checkout ({formatRupiah(total)}) →
          </Button>
        </div>
      </div>
    </div>
  );
}

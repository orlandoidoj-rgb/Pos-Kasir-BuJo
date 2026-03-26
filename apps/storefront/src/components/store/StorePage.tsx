import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMenu } from '@/hooks/useMenu';
import { useCartContext, useStoreContext } from '@/components/layout/MobileLayout';
import { useToast } from '@/components/ui/Toast';
import { Header } from '@/components/layout/Header';
import { HeroBanner } from '@/components/home/HeroBanner';
import { InfoChips } from '@/components/home/InfoChips';
import { PromoCarousel } from '@/components/home/PromoCarousel';
import { CategoryTabs } from '@/components/home/CategoryTabs';
import { FlashSale } from '@/components/home/FlashSale';
import { ProductList } from '@/components/menu/ProductList';
import { ProductDetail } from '@/components/menu/ProductDetail';
import { BottomCartBar } from '@/components/layout/BottomCartBar';
import { WhatsAppFab } from '@/components/ui/WhatsAppFab';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { MenuItem } from '@/types/product';

export function StorePage() {
  const { slug } = useParams();
  const { store, isLoading: storeLoading, error: storeError, isOpen } = useStoreContext();
  const { menuItems, categories, activeCategoryId, setActiveCategoryId, setSearchQuery, isLoading: menuLoading } = useMenu(slug || '');
  const { addItem, itemCount, subtotal } = useCartContext();
  const { showToast } = useToast();

  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  if (storeLoading) return <FullPageSpinner />;

  if (storeError || !store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <span className="text-5xl mb-4">😕</span>
        <h2 className="text-lg font-bold text-secondary mb-2">Toko tidak ditemukan</h2>
        <p className="text-gray-400 text-sm">Pastikan link yang kamu akses sudah benar</p>
      </div>
    );
  }

  const handleProductClick = (product: MenuItem) => {
    setSelectedProduct(product);
    setShowDetail(true);
  };

  const handleQuickAdd = (product: MenuItem) => {
    addItem(product, 1);
    showToast(`${product.name} ditambahkan ke keranjang`);
  };

  const handleAddFromDetail = (product: MenuItem, qty: number, notes?: string) => {
    addItem(product, qty, notes);
    showToast(`${qty}x ${product.name} ditambahkan ke keranjang`);
  };

  return (
    <div className="pb-4" id="store-page">
      {/* Header - transparent over hero */}
      <Header
        showSearch
        showCart
        showProfile
        cartCount={itemCount}
        onSearch={setSearchQuery}
        transparent
      />

      {/* Hero Banner */}
      <div className="-mt-[64px]">
        <HeroBanner store={store} isOpen={isOpen} />
      </div>

      {/* Info Chips */}
      <InfoChips store={store} />

      {/* Promo Carousel */}
      <PromoCarousel />

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelect={setActiveCategoryId}
      />

      {/* Flash Sale */}
      <FlashSale
        products={menuItems}
        onProductClick={handleProductClick}
      />

      {/* Product List */}
      <ProductList
        products={menuItems}
        isLoading={menuLoading}
        onProductClick={handleProductClick}
        onAddToCart={handleQuickAdd}
      />

      {/* Product Detail Bottom Sheet */}
      <ProductDetail
        product={selectedProduct}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onAddToCart={handleAddFromDetail}
      />

      {/* WhatsApp FAB */}
      {store.whatsappNumber && (
        <WhatsAppFab
          phone={store.whatsappNumber}
          hasCartBar={itemCount > 0}
        />
      )}

      {/* Bottom Cart Bar */}
      <BottomCartBar itemCount={itemCount} subtotal={subtotal} />
    </div>
  );
}

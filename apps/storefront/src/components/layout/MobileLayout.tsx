import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Header } from './Header';
import { BottomCartBar } from './BottomCartBar';
import { useCart } from '../../hooks/useCart';
import { useStore } from '../../hooks/useStore';
import { WhatsAppButton } from '../ui/WhatsAppButton';

export const MobileLayout: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { store } = useStore(slug || '');
  const { itemCount, subtotal } = useCart(slug || '');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative shadow-xl">
      <Header storeName={store?.storeName || 'Warung BuJo'} logo={store?.logoImage} />
      
      <main className="flex-1 pb-32">
        <Outlet />
      </main>

      {itemCount > 0 && (
        <BottomCartBar itemCount={itemCount} total={subtotal} slug={slug || ''} />
      )}

      {store?.whatsappNumber && (
        <WhatsAppButton phone={store.whatsappNumber} />
      )}
    </div>
  );
};

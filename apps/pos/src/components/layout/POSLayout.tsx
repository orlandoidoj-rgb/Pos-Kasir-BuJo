import React from 'react';
import Header from '../pos/Header';
import CategorySidebar from '../pos/CategorySidebar';
import ProductGrid from '../pos/ProductGrid';
import CartPanel from '../pos/CartPanel';

interface POSLayoutProps {
  session: any;
  cart: any;
  products: any;
  checkout: any;
  onlineOrders: {
    count: number;
    hasNew: boolean;
    onOpen: () => void;
  };
}

export default function POSLayout({ session, cart, products, checkout, onlineOrders }: POSLayoutProps) {
  return (
    <div className="flex flex-col h-screen w-full bg-[#f8fafc] font-sans text-gray-900 overflow-hidden">
      <Header 
        selectedBranch={session.selectedBranch}
        cashierName={session.cashierName}
        setIsHistoryOpen={session.setIsHistoryOpen}
        reloadAll={session.reloadAll}
        handleTutupShift={session.handleTutupShift}
        onlineOrderCount={onlineOrders.count}
        hasNewOnlineOrder={onlineOrders.hasNew}
        onOpenOnlineOrders={onlineOrders.onOpen}
      />
      
      <div className="flex flex-1 overflow-hidden">
         <CategorySidebar 
           activeCategory={products.activeCategory}
           setActiveCategory={products.setActiveCategory}
         />
         
         <ProductGrid 
           activeCategory={products.activeCategory}
           search={products.search}
           setSearch={products.setSearch}
           filteredProducts={products.filteredProducts}
           cart={cart.cart}
           addToCart={cart.addToCart}
           screen={session.screen}
           orderType={session.orderSetup.orderType}
         />

         <CartPanel 
           screen={session.screen}
           setScreen={session.setScreen}
           showPayment={checkout.showPayment}
           setShowPayment={checkout.setShowPayment}
           orderSetup={session.orderSetup}
           setOrderSetup={session.setOrderSetup}
           cart={cart.cart}
           setCart={cart.setCart}
           updateQty={cart.updateQty}
           subtotal={cart.subtotal}
           tax={cart.tax}
           total={cart.total}
           handleConfirmPayment={checkout.handleConfirmPayment}
         />
      </div>
    </div>
  );
}

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import LoginScreen from './components/screens/LoginScreen';
import POSLayout from './components/layout/POSLayout';
import SuccessToast from './components/pos/SuccessToast';
import TransactionHistory from './components/TransactionHistory';
import PrintContainer from './components/receipt/PrintContainer';
import { useSession, useCart, useCheckout, useProducts, useOnlineOrders } from './hooks';
import OnlineOrdersView from './components/online/OnlineOrdersView';
import { unlockAudio } from './utils/notification-sound';

export default function App() {
  const session = useSession();
  const cart = useCart(session.orderSetup);
  const products = useProducts(session.selectedBranchId, session.orderSetup.orderType);
  const onlineOrders = useOnlineOrders(session.selectedBranchId);
  const checkout = useCheckout(
    cart.cart, 
    session.orderSetup, 
    session.setOrderSetup,
    session.selectedBranchId, 
    session.selectedBranch, 
    session.cashierName,
    cart.subtotal, 
    cart.tax, 
    cart.discount, 
    cart.total,
    cart.setCart, 
    session.setScreen,
    session.recentTx, 
    session.setRecentTx
  );

  if (session.screen === 'login') {
    return <LoginScreen branches={session.branches} onLogin={(bId, bName, cName) => {
      unlockAudio(); // Unlock audio on interaction
      session.handleLogin(bId, bName, cName);
    }} />;
  }

  return (
    <>
      <div className={session.screen === 'online_orders' ? 'hidden' : 'block'}>
        <POSLayout
          session={session}
          cart={cart}
          products={products}
          checkout={checkout}
          onlineOrders={{
            count: onlineOrders.pendingCount,
            hasNew: onlineOrders.hasNew,
            onOpen: () => {
              onlineOrders.markAsSeen();
              session.setScreen('online_orders');
            }
          }}
        />
      </div>

      <AnimatePresence>
        {session.screen === 'online_orders' && (
          <div className="fixed inset-0 z-50">
            <OnlineOrdersView 
              orders={onlineOrders.orders}
              isLoading={onlineOrders.isLoading}
              onRefresh={onlineOrders.refresh}
              onBack={() => session.setScreen('ordering')}
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkout.txSuccess && <SuccessToast data={checkout.txSuccess} />}
      </AnimatePresence>
      <AnimatePresence>
        {session.isHistoryOpen && (
          <TransactionHistory
            isOpen={session.isHistoryOpen}
            onClose={session.closeHistory}
            transactions={session.recentTx}
            initialTransaction={session.selectedHistoryTx}
          />
        )}
      </AnimatePresence>
      <PrintContainer />
    </>
  );
}

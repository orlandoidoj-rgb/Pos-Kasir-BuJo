import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { StorePage } from '@/components/store/StorePage';
import { CartPage } from '@/components/cart/CartPage';
import { CheckoutPage } from '@/components/checkout/CheckoutPage';
import { OrderListPage } from '@/components/order/OrderListPage';
import { OrderDetailPage } from '@/components/order/OrderDetailPage';
import { LoginPage } from '@/components/auth/LoginPage';
import { RegisterPage } from '@/components/auth/RegisterPage';
import { CompleteProfilePage } from '@/components/auth/CompleteProfilePage';
import { ProfilePage } from '@/components/auth/ProfilePage';
import { MyAccountPage } from '@/components/auth/MyAccountPage';
import { LandingPage } from '@/components/LandingPage';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/:slug" element={<MobileLayout />}>
            <Route index element={<StorePage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="orders" element={<OrderListPage />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/complete-profile" element={<CompleteProfilePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-account" element={<MyAccountPage />} />
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;

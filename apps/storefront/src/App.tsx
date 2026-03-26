import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MobileLayout } from './components/layout/MobileLayout';
import { StorePage } from './components/store/StorePage';
import { CartSheet } from './components/cart/CartSheet';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderListPage } from './components/order/OrderListPage';
import { OrderDetailPage } from './components/order/OrderDetailPage';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { ProfilePage } from './components/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:slug" element={<MobileLayout />}>
          <Route index element={<StorePage />} />
          <Route path="cart" element={<CartSheet />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrderListPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;

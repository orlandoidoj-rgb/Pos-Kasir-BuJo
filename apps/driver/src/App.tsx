import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import OrderDetailPage from './pages/OrderDetailPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('driver_token')
  return token ? <>{children}</> : <Navigate to="/driver/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/driver/login" element={<LoginPage />} />
        <Route path="/driver/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/driver/order/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/driver/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

// Redirect to dashboard — detail is shown inline on dashboard
import { Navigate, useParams } from 'react-router-dom'

export default function OrderDetailPage() {
  return <Navigate to="/driver/" replace />
}

import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function ProtectedRoute({ children }) {
  const { token, user } = useAuthStore()
  const { pathname } = useLocation()

  if (!token) return <Navigate to="/login" replace />
  if (user?.mustChangePassword && pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }
  return children
}

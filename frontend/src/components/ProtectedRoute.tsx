import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ allow }: { allow: Array<'ADMIN' | 'CLIENTE'> }) {
  const { token, user } = useAuth()
  if (!token || !user) return <Navigate to="/login" replace />
  if (user.role && !allow.includes(user.role)) return <Navigate to="/" replace />
  return <Outlet />
}



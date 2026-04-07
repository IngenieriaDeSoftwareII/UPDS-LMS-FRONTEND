import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types/auth'

interface Props {
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, sessionExpiresAt, hasRole, logout } = useAuthStore()

  // Sesión expirada mientras el navegador estaba cerrado
  if (isAuthenticated && sessionExpiresAt && Date.now() > sessionExpiresAt) {
    logout()
    return <Navigate to="/login" replace />
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles && !hasRole(allowedRoles)) return <Navigate to="/unauthorized" replace />

  return <Outlet />
}

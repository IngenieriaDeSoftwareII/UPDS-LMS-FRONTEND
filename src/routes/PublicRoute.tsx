import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types/auth'

const roleRoutes: Record<UserRole, string> = {
  Admin: '/admin/dashboard',
  Docente: '/teacher/dashboard',
  Estudiante: '/student/dashboard',
}

export function PublicRoute() {
  const { isAuthenticated, role } = useAuthStore()

  if (isAuthenticated && role) {
    return <Navigate to={roleRoutes[role]} replace />
  }

  return <Outlet />
}

import { Navigate, Outlet } from 'react-router-dom'
//import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types'

interface Props {
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: Props) {

  //const { isAuthenticated, hasRole } = useAuthStore()

  // prueba sin validar Simula que el usuario está autenticado como student
  const DEV_MODE = true
  const fakeRole: UserRole = 'student'

  if (DEV_MODE) {
    if (allowedRoles && !allowedRoles.includes(fakeRole)) {
      return <Navigate to="/student/dashboard" replace />
    }

    return <Outlet />
  }

  /*
  if (!isAuthenticated)
    return <Navigate to="/login" replace />

  if (allowedRoles && !hasRole(allowedRoles))
    return <Navigate to="/unauthorized" replace />

  return <Outlet()
  */

  return <Outlet />
}
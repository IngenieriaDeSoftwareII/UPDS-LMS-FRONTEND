import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Login } from '@/pages/Login'
import { PersonsPage } from '@/pages/admin/PersonsPage'
import { AdminRoutes } from '@/routes/AdminRoutes'
import { TeacherRoutes } from '@/routes/TeacherRoutes'
import { StudentRoutes } from '@/routes/StudentRoutes'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types/auth'

const roleHome: Record<UserRole, string> = {
  Admin: '/admin/dashboard',
  Docente: '/teacher/dashboard',
  Estudiante: '/student/dashboard',
}

function SmartRedirect() {
  const { isAuthenticated, role } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={role ? roleHome[role] : '/login'} replace />
}

function UnauthorizedPage() {
  const { role } = useAuthStore()
  const navigate = useNavigate()
  const home = role ? roleHome[role] : '/login'
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-2xl font-bold">Acceso denegado</h1>
      <p className="text-muted-foreground">No tienes permisos para ver esta página.</p>
      <button
        onClick={() => navigate(home, { replace: true })}
        className="text-sm underline text-muted-foreground hover:text-foreground"
      >
        Volver al inicio
      </button>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Docente']} />}>
            <Route path="/teacher/*" element={<TeacherRoutes />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Estudiante']} />}>
            <Route path="/student/*" element={<StudentRoutes />} />
          </Route>

          {/* Rutas compartidas — accesibles por cualquier rol autenticado */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Página de ejemplo */}
      <Route path="/example/persons" element={<PersonsPage />} />

      {/* Acceso denegado */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Redirecciones */}
      <Route path="/" element={<SmartRedirect />} />
      <Route path="*" element={<SmartRedirect />} />
    </Routes >
  )
}

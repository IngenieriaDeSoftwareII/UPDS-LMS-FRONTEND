import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Login } from '@/pages/Login'
import { PersonsPage } from '@/pages/admin/PersonsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { AdminRoutes } from './AdminRoutes'
import { TeacherRoutes } from './TeacherRoutes'
import { StudentRoutes } from './StudentRoutes'

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

          {/* Ruta compartida — accesible por cualquier rol autenticado */}
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* TODO: eliminar antes de producción */}
      <Route element={<Layout />}>
        <Route path="/example/persons" element={<PersonsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
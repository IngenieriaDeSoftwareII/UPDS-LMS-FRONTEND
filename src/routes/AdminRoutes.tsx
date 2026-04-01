import { Route, Routes } from 'react-router-dom'
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { PersonsPage } from '@/pages/admin/PersonsPage'
import { UsersPage } from '@/pages/admin/UsersPage'
import { AdminCourseReportsPage } from '@/pages/admin/reports/AdminCourseReportsPage'
import { AdminTeacherReportsPage } from '@/pages/admin/reports/AdminTeacherReportsPage'

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="persons" element={<PersonsPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="reports/courses" element={<AdminCourseReportsPage />} />
      <Route path="reports/teachers" element={<AdminTeacherReportsPage />} />
    </Routes>
  )
}

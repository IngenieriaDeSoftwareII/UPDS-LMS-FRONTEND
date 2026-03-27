import { Route, Routes } from 'react-router-dom'
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { PersonsPage } from '@/pages/admin/PersonsPage'
import { UsersPage } from '@/pages/admin/UsersPage'

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="persons" element={<PersonsPage />} />
      <Route path="users" element={<UsersPage />} />
    </Routes>
  )
}

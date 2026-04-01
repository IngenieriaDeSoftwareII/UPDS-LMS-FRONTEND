import { Route, Routes } from 'react-router-dom'
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { PersonsPage } from '@/pages/admin/PersonsPage'
import { UsersPage } from '@/pages/admin/UsersPage'
import { CoursesPage } from '@/pages/admin/CoursesPage'
import { CategoriesPage } from '@/pages/admin/CategoriesPage'
import { CatalogsPage } from '@/pages/admin/CatalogsPage'
import { TeachersPage } from '@/pages/admin/TeachersPage'

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="persons" element={<PersonsPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="courses" element={<CoursesPage />} />
      <Route path="categories" element={<CategoriesPage />} />
      <Route path="catalogs" element={<CatalogsPage />} />
      <Route path="teachers" element={<TeachersPage />} />
    </Routes>
  )
}

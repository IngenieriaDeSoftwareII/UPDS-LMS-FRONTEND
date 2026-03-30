import { Route, Routes } from 'react-router-dom'
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { PersonsPage } from '@/pages/admin/PersonsPage'
import { UsersPage } from '@/pages/admin/UsersPage'
import { CatalogsPage } from '@/pages/admin/CatalogsPage'
import { CategoriesPage } from '@/pages/admin/CategoriesPage'
import { CoursesPage } from '@/pages/admin/CoursesPage'
import { TeachersPage } from '@/pages/admin/TeachersPage'

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="persons" element={<PersonsPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="catalogs" element={<CatalogsPage />} />
      <Route path="categories" element={<CategoriesPage />} />
      <Route path="courses" element={<CoursesPage />} />
      <Route path="teachers" element={<TeachersPage />} />
    </Routes>
  )
}

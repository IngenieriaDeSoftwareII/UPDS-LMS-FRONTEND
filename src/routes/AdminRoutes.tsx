import { Route, Routes } from 'react-router-dom'
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { PersonsPage } from '@/pages/admin/PersonsPage'
import { UsersPage } from '@/pages/admin/UsersPage'
import { LessonsPage } from '@/pages/admin/lessons/LessonsPage'
import { ContentsPage } from '@/pages/admin/contents/ContentsPage'
import { DocumentsPage } from '@/pages/admin/documents/DocumentsPage'
import { DocumentUploadPage } from '@/pages/admin/documents/DocumentUploadPage'
import { DocumentEditPage } from '@/pages/admin/documents/DocumentEditPage'
import { ImagesPage } from '@/pages/admin/images/ImagesPage'
import { ImageUploadPage } from '@/pages/admin/images/ImageUploadPage'
import { ImageEditPage } from '@/pages/admin/images/ImageEditPage'
import ModulesPage from '@/pages/admin/modules/ModulesPage'

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="persons" element={<PersonsPage />} />
      <Route path="users" element={<UsersPage />} />
      {/* Leccion */}
      <Route path="/lessons" element={<LessonsPage />} />
      {/* Content */}
      <Route path="/contents" element={<ContentsPage />} />
      {/* DocumentContent */}
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/uploaddocuments" element={<DocumentUploadPage />} />
      <Route path="/documents/edit/:id" element={<DocumentEditPage />} />
      {/* ImageContent */}
      <Route path="/images" element={<ImagesPage />} />
      <Route path="/uploadimage" element={<ImageUploadPage />} />
      <Route path="/images/edit/:id" element={<ImageEditPage />} />
      {/* Modules */}
      <Route path="modules" element={<ModulesPage />} />
    </Routes>
  )
}

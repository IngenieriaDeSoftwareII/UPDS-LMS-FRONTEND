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
import { AdminCourseReportsPage } from '@/pages/admin/reports/AdminCourseReportsPage'
import { AdminTeacherReportsPage } from '@/pages/admin/reports/AdminTeacherReportsPage'
import { CoursesPage } from '@/pages/admin/CoursesPage'
import { CategoriesPage } from '@/pages/admin/CategoriesPage'
import { CatalogsPage } from '@/pages/admin/CatalogsPage'
import { TeachersPage } from '@/pages/admin/TeachersPage'
import { VideosPage } from '@/pages/admin/videos/VideosPage'
import { VideoUploadPage } from '@/pages/admin/videos/VideoUploadPage'
import { VideoEditPage } from '@/pages/admin/videos/VideoEditPage'

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
      <Route path="documents" element={<DocumentsPage />} />
      <Route path="documents/upload" element={<DocumentUploadPage />} />
      <Route path="documents/edit/:id" element={<DocumentEditPage />} />
      {/* ImageContent */}
      <Route path="images" element={<ImagesPage />} />
      <Route path="images/upload" element={<ImageUploadPage />} />
      <Route path="images/edit/:id" element={<ImageEditPage />} />
      {/* Modules */}
      <Route path="modules" element={<ModulesPage />} />
      {/* VideoContent */}
      <Route path="videos" element={<VideosPage />} />
      <Route path="videos/upload" element={<VideoUploadPage />} />
      <Route path="videos/edit/:id" element={<VideoEditPage />} />

      <Route path="reports/courses" element={<AdminCourseReportsPage />} />
      <Route path="reports/teachers" element={<AdminTeacherReportsPage />} />
      <Route path="courses" element={<CoursesPage />} />
      <Route path="categories" element={<CategoriesPage />} />
      <Route path="catalogs" element={<CatalogsPage />} />
      <Route path="teachers" element={<TeachersPage />} />
    </Routes>
  )
}

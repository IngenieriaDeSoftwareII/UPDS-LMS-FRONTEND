import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Login } from '@/pages/Login'
import { PersonsPage } from '@/pages/admin/PersonsPage'
import { AdminRoutes } from '@/routes/AdminRoutes'
import { TeacherRoutes } from '@/routes/TeacherRoutes'
import { StudentRoutes } from '@/routes/StudentRoutes'
import { LessonsPage } from '@/pages/admin/lessons/LessonsPage'
import { ContentsPage } from '@/pages/admin/contents/ContentsPage'
import { DocumentUploadPage } from '@/pages/admin/documents/DocumentUploadPage'
import { DocumentsPage } from '@/pages/admin/documents/DocumentsPage'
import { DocumentEditPage } from '@/pages/admin/documents/DocumentEditPage'
import { TeacherLessonsPage } from '@/pages/teacher/Lessons/TeacherLessonsPage'
import { LessonDetailPage } from '@/pages/teacher/Lessons/LessonDetailPage'
import { TeacherDocumentUploadPage } from '@/pages/teacher/Lessons/TeacherDocumentUploadPage'
import { TeacherDocumentEditPage } from '@/pages/teacher/Lessons/TeacherDocumentEditPage'
import { StudentDocumentsPage } from '@/pages/student/documents/StudentDocumentsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import ModulesPage from '@/pages/admin/modules/ModulesPage'
import { ImagesPage } from '@/pages/admin/images/ImagesPage'
import { ImageUploadPage } from '@/pages/admin/images/ImageUploadPage'
import { ImageEditPage } from '@/pages/admin/images/ImageEditPage'

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

      {/* Página de ejemplo */}
      <Route path="/example/persons" element={<PersonsPage />} />

      {/* Leccion */}
      <Route path="/lessons" element={<LessonsPage />} />
      {/* Content */}
      <Route path="/contents" element={<ContentsPage />} />

      {/* DocumentContent */}
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/uploaddocuments" element={<DocumentUploadPage />} />
      <Route path="/documents/edit/:id" element={<DocumentEditPage />} />

      {/* Teacher */}
      <Route path="/teacher/lessons" element={<TeacherLessonsPage />} />
      <Route path="/teacher/lessons/:id" element={<LessonDetailPage />} />
      <Route path="/teacher/documents/upload" element={<TeacherDocumentUploadPage />} />
      <Route path="/teacher/documents/edit/:id" element={<TeacherDocumentEditPage />} />

      {/* Student */}
      <Route path="/student/documents" element={<StudentDocumentsPage />} />

      {/* ImageContent */}
      <Route path="/images" element={<ImagesPage />} />
      <Route path="/uploadimage" element={<ImageUploadPage />} />
      <Route path="/images/edit/:id" element={<ImageEditPage />} />


      {/* Modules */}
      <Route path="modules" element={<ModulesPage />} />
      
      {/* Redirecciones */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes >
  )
}

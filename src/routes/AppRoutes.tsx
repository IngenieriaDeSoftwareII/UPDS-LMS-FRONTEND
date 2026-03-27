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

export function AppRoutes() {
  return (
    <Routes>
      {/* Login público */}
      <Route path="/login" element={<Login />} />

      {/* Layout principal sin protección */}
      <Route element={<Layout />}>
        
        {/* Rutas admin */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Rutas teacher */}
        <Route path="/teacher/*" element={<TeacherRoutes />} />

        {/* Rutas student */}
        <Route path="/student/*" element={<StudentRoutes />} />

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
      </Route>

      {/* Redirecciones */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  )
}
// import { Routes, Route, Navigate } from 'react-router-dom'
// import { Layout } from '@/components/layout/Layout'
// import { Login } from '@/pages/Login'
// import { PersonsPage } from '@/pages/admin/PersonsPage'
// import { ProtectedRoute } from './ProtectedRoute'
// import { PublicRoute } from './PublicRoute'
// import { AdminRoutes } from './AdminRoutes'
// import { TeacherRoutes } from './TeacherRoutes'
// import { StudentRoutes } from './StudentRoutes'

// export function AppRoutes() {
//   return (
//     <Routes>
//       <Route element={<PublicRoute />}>
//         <Route path="/login" element={<Login />} />
//       </Route>

//       <Route element={<ProtectedRoute />}>
//         <Route element={<Layout />}>
//           <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
//             <Route path="/admin/*" element={<AdminRoutes />} />
//           </Route>

//           <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
//             <Route path="/teacher/*" element={<TeacherRoutes />} />
//           </Route>

//           <Route element={<ProtectedRoute allowedRoles={['student']} />}>
//             <Route path="/student/*" element={<StudentRoutes />} />
//           </Route>
//         </Route>
//       </Route>

//       {/* TODO: eliminar antes de producción */}
//       <Route element={<Layout />}>
//         <Route path="/example/persons" element={<PersonsPage />} />
//       </Route>

//       <Route path="/" element={<Navigate to="/login" replace />} />
//       <Route path="*" element={<Navigate to="/login" replace />} />
//     </Routes>
//   )
// }

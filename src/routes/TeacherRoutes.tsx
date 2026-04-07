import { Route, Routes } from 'react-router-dom'
import { TeacherDashboard } from '@/pages/teacher/Dashboard'
import { EvaluationManagementPage } from '@/pages/teacher/EvaluationManagementPage'
import { EvaluationGradesPage } from '@/pages/teacher/EvaluationGradesPage'
import { MyEvaluationsPage } from '@/pages/teacher/MyEvaluationsPage'
import { TeacherReportsPage } from '@/pages/teacher/reports/TeacherReportsPage'
import { TeacherCourseReportPage } from '@/pages/teacher/reports/TeacherCourseReportPage'
import { TeacherCoursesPage } from '@/pages/teacher/TeacherCoursesPage'
import { TeacherLessonsPage } from '@/pages/teacher/Lessons/TeacherLessonsPage'
import { LessonDetailPage } from '@/pages/teacher/Lessons/LessonDetailPage'
import { TeacherDocumentUploadPage } from '@/pages/teacher/content/TeacherDocumentUploadPage'
import { TeacherDocumentEditPage } from '@/pages/teacher/content/TeacherDocumentEditPage'
import { TeacherImageUploadPage } from '@/pages/teacher/content/TeacherImageUploadPage'
import { TeacherImageEditPage } from '@/pages/teacher/content/TeacherImageEditPage'
import { TeacherCreateModulePage } from '@/pages/teacher/module/TeacherCreateModulePage'
import { TeacherEditModulePage } from '@/pages/teacher/module/TeacherEditModulePage'
import { TeacherHomeworkEditPage } from '@/pages/teacher/homework/TeacherHomeworkEditPage'
import { TeacherVideoUploadPage } from '@/pages/teacher/content/TeacherVideoUploadPage'
import { TeacherVideoEditPage } from '@/pages/teacher/content/TeacherVideoEditPage'
import { TeacherCreateHomeworkPage } from '@/pages/teacher/homework/TeacherCreateHomeworkPage'
import { TeacherSubmissionsPage } from '@/pages/teacher/homework/TeacherSubmissionsPage'

export function TeacherRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<TeacherDashboard />} />
      <Route path="courses" element={<TeacherCoursesPage />} />
      <Route path="evaluations" element={<EvaluationManagementPage />} />
      <Route path="evaluations/edit/:courseId" element={<EvaluationManagementPage />} />
      <Route path="evaluations/grades" element={<EvaluationGradesPage />} />
      <Route path="my-evaluations" element={<MyEvaluationsPage />} />

      {/* pagina para seleccionar un mudlo y listar lecciones y contenidos del curso, pasarle el id de curso */}
      <Route path="lessons/:id" element={<TeacherLessonsPage />} />
      {/* Teacher Modulos,leciones y contenidos*/}
      <Route path="lessons/:courseId/detail/:id" element={<LessonDetailPage />} />
      <Route path="documents/upload" element={<TeacherDocumentUploadPage />} />
      <Route path="documents/edit/:id" element={<TeacherDocumentEditPage />} />
      <Route path="images/upload" element={<TeacherImageUploadPage />} />
      <Route path="images/edit/:id" element={<TeacherImageEditPage />} />
      <Route path="homework/create" element={<TeacherCreateHomeworkPage />} />
      <Route path="homework/edit/:id" element={<TeacherHomeworkEditPage />} />
      <Route path="homework/submissions/:homeworkId" element={<TeacherSubmissionsPage />} />
      <Route path="modules/create" element={<TeacherCreateModulePage />} />
      <Route path="modules/edit/:id" element={<TeacherEditModulePage />} />
      <Route path="videos/create" element={<TeacherVideoUploadPage />} />
      <Route path="videos/edit/:id" element={<TeacherVideoEditPage />} />

      <Route path="reports" element={<TeacherReportsPage />} />
      <Route path="reports/courses/:courseId" element={<TeacherCourseReportPage />} />
    </Routes>
  )
}

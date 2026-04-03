import { Route, Routes } from 'react-router-dom'
import { TeacherDashboard } from '@/pages/teacher/Dashboard'
import { EvaluationManagementPage } from '@/pages/teacher/EvaluationManagementPage'
import { EvaluationGradesPage } from '@/pages/teacher/EvaluationGradesPage'
import { TeacherReportsPage } from '@/pages/teacher/reports/TeacherReportsPage'
import { TeacherCourseReportPage } from '@/pages/teacher/reports/TeacherCourseReportPage'
import { TeacherCoursesPage } from '@/pages/teacher/TeacherCoursesPage'

import { TeacherLessonsPage } from '@/pages/teacher/Lessons/TeacherLessonsPage'
import { TeacherModulesPage } from '@/pages/teacher/Lessons/TeacherModulesPage'
import { LessonDetailPage } from '@/pages/teacher/Lessons/LessonDetailPage'
import { TeacherDocumentUploadPage } from '@/pages/teacher/Lessons/TeacherDocumentUploadPage'
import { TeacherDocumentEditPage } from '@/pages/teacher/Lessons/TeacherDocumentEditPage'
import { TeacherImageUploadPage } from '@/pages/teacher/Lessons/TeacherImageUploadPage'
import { TeacherImageEditPage } from '@/pages/teacher/Lessons/TeacherImageEditPage'

export function TeacherRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<TeacherDashboard />} />
      <Route path="courses" element={<TeacherCoursesPage />} />
      <Route path="evaluations" element={<EvaluationManagementPage />} />
      <Route path="evaluations/grades" element={<EvaluationGradesPage />} />
      {/* Teacher Modulos,leciones y contenidos*/}
      <Route path="modules" element={<TeacherModulesPage />} />
      <Route path="modules/:moduleId/lessons" element={<TeacherLessonsPage />} />
      <Route path="lessons/:id" element={<LessonDetailPage />} />
      <Route path="documents/upload" element={<TeacherDocumentUploadPage />} />
      <Route path="documents/edit/:id" element={<TeacherDocumentEditPage />} />
      <Route path="images/upload" element={<TeacherImageUploadPage />} />
      <Route path="images/edit/:id" element={<TeacherImageEditPage />} />
      <Route path="reports" element={<TeacherReportsPage />} />
      <Route path="reports/courses/:courseId" element={<TeacherCourseReportPage />} />
    </Routes>
  )
}

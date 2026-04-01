import { Route, Routes } from 'react-router-dom'
import { TeacherDashboard } from '@/pages/teacher/Dashboard'
import { EvaluationManagementPage } from '@/pages/teacher/EvaluationManagementPage'
import { EvaluationGradesPage } from '@/pages/teacher/EvaluationGradesPage'
import { TeacherReportsPage } from '@/pages/teacher/reports/TeacherReportsPage'
import { TeacherCourseReportPage } from '@/pages/teacher/reports/TeacherCourseReportPage'

export function TeacherRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<TeacherDashboard />} />
      <Route path="evaluations" element={<EvaluationManagementPage />} />
      <Route path="evaluations/grades" element={<EvaluationGradesPage />} />
      <Route path="reports" element={<TeacherReportsPage />} />
      <Route path="reports/courses/:courseId" element={<TeacherCourseReportPage />} />
    </Routes>
  )
}

import { Route, Routes } from 'react-router-dom'
import { StudentDashboard } from '@/pages/student/Dashboard'

import CourseCatalog from "@/pages/student/CourseCatalog";
import { CourseDetail } from "@/pages/student/CourseDetail"
import { MyCourses } from '@/pages/student/MyCourses'
import { StudentEvaluationsPage } from '@/pages/student/StudentEvaluationsPage'
import { SubmitEvaluationPage } from '@/pages/student/SubmitEvaluationPage'
import { EvaluationResultPage } from '@/pages/student/EvaluationResultPage'
import { MyEvaluationGradesPage } from '@/pages/student/MyEvaluationGradesPage'

import { StudentModulesPage } from '@/pages/student/Lessons/StudentModulesPage'
import { StudentLessonsPage } from '@/pages/student/Lessons/StudentLessonsPage'

export function StudentRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<StudentDashboard />} />
      <Route path="courses" element={<CourseCatalog />} />
      <Route path="courses/:id" element={<CourseDetail />} />
      <Route path="mycourses" element={<MyCourses />} />
      <Route path="evaluations" element={<StudentEvaluationsPage />} />
      <Route path="evaluations/my-grades" element={<MyEvaluationGradesPage />} />
      <Route path="evaluations/:cursoId" element={<SubmitEvaluationPage />} />
      <Route path="evaluations/:cursoId/result" element={<EvaluationResultPage />} />
      {/* Student */}
      <Route path="modules" element={<StudentModulesPage />} />
      <Route path="modules/:moduleId/lessons" element={<StudentLessonsPage />} />
    </Routes>
  )
}

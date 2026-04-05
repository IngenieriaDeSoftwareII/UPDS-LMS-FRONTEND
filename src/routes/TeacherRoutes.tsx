import { Route, Routes } from 'react-router-dom'
import { TeacherDashboard } from '@/pages/teacher/Dashboard'
import { EvaluationManagementPage } from '@/pages/teacher/EvaluationManagementPage'
import { EvaluationGradesPage } from '@/pages/teacher/EvaluationGradesPage'
import { TeacherReportsPage } from '@/pages/teacher/reports/TeacherReportsPage'
import { TeacherCourseReportPage } from '@/pages/teacher/reports/TeacherCourseReportPage'
import { TeacherCoursesPage } from '@/pages/teacher/TeacherCoursesPage'
import { TeacherLessonsPage } from '@/pages/teacher/Lessons/TeacherLessonsPage'
import { LessonDetailPage } from '@/pages/teacher/Lessons/LessonDetailPage'
import { TeacherDocumentUploadPage } from '@/pages/teacher/Lessons/TeacherDocumentUploadPage'
import { TeacherDocumentEditPage } from '@/pages/teacher/Lessons/TeacherDocumentEditPage'
import { TeacherImageUploadPage } from '@/pages/teacher/Lessons/TeacherImageUploadPage'
import { TeacherImageEditPage } from '@/pages/teacher/Lessons/TeacherImageEditPage'
import { TeacherCreateModulePage } from '@/pages/teacher/Lessons/TeacherCreateModulePage'
import { TeacherEditModulePage } from '@/pages/teacher/Lessons/TeacherEditModulePage'
import { TeacherHomeworkEditPage } from '@/pages/teacher/Lessons/TeacherHomeworkEditPage'
import { TeacherVideoUploadPage } from '@/pages/teacher/Lessons/TeacherVideoUploadPage'
import { TeacherVideoEditPage } from '@/pages/teacher/Lessons/TeacherVideoEditPage'
import { TestTeacherLessonsPage } from '@/pages/teacher/Lessons/TestTeacherLessonsPage'
import { TeacherCreateHomeworkPage } from '@/pages/teacher/Lessons/TeacherCreateHomeworkPage'

export function TeacherRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<TeacherDashboard />} />
      <Route path="courses" element={<TeacherCoursesPage />} />
      <Route path="evaluations" element={<EvaluationManagementPage />} />
      <Route path="evaluations/grades" element={<EvaluationGradesPage />} />
     
      {/* Probar TechaeressonPage para borrar OJO */}
      <Route path="test/lessons" element={<TestTeacherLessonsPage />} />
       {/* Teacher Modulos,leciones y contenidos*/}
      <Route path="lessons/:id" element={<TeacherLessonsPage />} />
      <Route path="lessons/:courseId/detail/:id" element={<LessonDetailPage />} />
      <Route path="documents/upload" element={<TeacherDocumentUploadPage />} />
      <Route path="documents/edit/:id" element={<TeacherDocumentEditPage />} />
      <Route path="images/upload" element={<TeacherImageUploadPage />} />
      <Route path="images/edit/:id" element={<TeacherImageEditPage />} />
      <Route path="homework/create" element={<TeacherCreateHomeworkPage />} />
      <Route path="homework/edit/:id" element={<TeacherHomeworkEditPage />} />
      <Route path="modules/create" element={<TeacherCreateModulePage />} />
      <Route path="modules/edit/:id" element={<TeacherEditModulePage />} />
      <Route path="videos/create" element={<TeacherVideoUploadPage />} />
      <Route path="videos/edit/:id" element={<TeacherVideoEditPage />} />
      
      
    
      <Route path="reports" element={<TeacherReportsPage />} />
      <Route path="reports/courses/:courseId" element={<TeacherCourseReportPage />} />
    </Routes>
  )
}

import { Route, Routes } from 'react-router-dom'
import { StudentDashboard } from '@/pages/student/Dashboard'

import CourseCatalog from "@/pages/student/CourseCatalog";
import { CourseDetail } from "@/pages/student/CourseDetail"

export function StudentRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<StudentDashboard />} />
      <Route path="courses" element={<CourseCatalog />} />
      <Route path="courses/:id" element={<CourseDetail />} />
    </Routes>
  )
}

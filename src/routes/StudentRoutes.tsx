import { Navigate, Route, Routes } from 'react-router-dom'
import { StudentDashboard } from '@/pages/student/Dashboard'

import CourseCatalog from "@/pages/student/CourseCatalog";
import { CourseDetail } from "@/pages/student/CourseDetail"
import { MyCourses } from '@/pages/student/MyCourses'

export function StudentRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<StudentDashboard />} />
      <Route path="courses" element={<CourseCatalog />} />
      <Route path="courses/:id" element={<CourseDetail />} />
      <Route path="mycourses" element={<MyCourses />} />
    </Routes>
  )
}

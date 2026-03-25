import { Route, Routes } from 'react-router-dom'
import { StudentDashboard } from '@/pages/student/Dashboard'

import CourseCatalog from "@/pages/student/CourseCatalog";

export function StudentRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<StudentDashboard />} />
      <Route path="courses" element={<CourseCatalog />} />
    </Routes>
  )
}

import { Route, Routes } from 'react-router-dom'
import { StudentDashboard } from '@/pages/student/Dashboard'

export function StudentRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<StudentDashboard />} />
    </Routes>
  )
}

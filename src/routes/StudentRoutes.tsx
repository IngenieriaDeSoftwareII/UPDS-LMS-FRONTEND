import { Route, Routes } from 'react-router-dom'
import { StudentDashboard } from '@/pages/student/Dashboard'
import { StudentDocumentsPage } from '@/pages/student/documents/StudentDocumentsPage'

export function StudentRoutes() {
  return (
    <Routes>
      <Route path="documents" element={<StudentDocumentsPage />} />
      <Route path="dashboard" element={<StudentDashboard />} />
    </Routes>
  )
}

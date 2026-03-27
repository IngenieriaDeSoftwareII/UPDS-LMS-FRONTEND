import { Route, Routes } from "react-router-dom"
import { TeacherDashboard } from "@/pages/teacher/Dashboard"


export function TeacherRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<TeacherDashboard />} />
      
    </Routes>
  )
}

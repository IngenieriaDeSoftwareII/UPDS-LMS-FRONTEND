import http from '@/lib/http'
import type {
  CompleteLessonResponse,
  ModuleWeightedGrade,
  StudentCourseLearning,
  StudentDashboardProgress,
} from '@/types/student-progress'

export const studentProgressService = {
  getCourseLearning(cursoId: number) {
    return http.get<StudentCourseLearning>(`/student/progress/courses/${cursoId}/learning`).then(r => r.data)
  },

  completeLesson(leccionId: number) {
    return http
      .post<CompleteLessonResponse>(`/student/progress/lessons/${leccionId}/complete`)
      .then(r => r.data)
  },

  getDashboard() {
    return http.get<StudentDashboardProgress[]>('/student/progress/dashboard').then(r => r.data)
  },

  getModuleGrades(cursoId: number) {
    return http.get<ModuleWeightedGrade[]>(`/student/progress/courses/${cursoId}/module-grades`).then(r => r.data)
  },

  async downloadCertificate(cursoId: number) {
    const res = await http.get<Blob>(`/student/progress/courses/${cursoId}/certificate`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `certificado-curso-${cursoId}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  },
}

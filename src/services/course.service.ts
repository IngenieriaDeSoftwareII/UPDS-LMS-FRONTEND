import http from '@/lib/http'

export interface CourseDto {
  id: number
  titulo: string
  descripcion?: string
  nivel: string
  imagenUrl?: string | null
  publicado?: boolean
  duracionTotalMin?: number | null
  maxEstudiantes?: number | null
}

export const courseService = {
  getAll: (): Promise<CourseDto[]> =>
    http.get<CourseDto[]>('/Courses').then(res => res.data),

  getByTeacher: (teacherId: number): Promise<CourseDto[]> =>
    http.get<CourseDto[]>(`/Courses/teacher/${teacherId}`).then(res => res.data),

  getByTeacherWithoutEvaluation: (teacherId: number): Promise<CourseDto[]> =>
    http.get<CourseDto[]>(`/Courses/teacher/${teacherId}/without-evaluation`).then(res => res.data),
}
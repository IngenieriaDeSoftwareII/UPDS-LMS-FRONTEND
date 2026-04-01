import http from '@/lib/http'
import { createService } from './base.service'
import type { Course, CourseCreateDTO, CourseUpdateDTO } from '@/types/course'

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

const baseService = createService<CourseCreateDTO, CourseUpdateDTO, Course>('/courses')

export const courseService = {
  ...baseService,

  getAll: (): Promise<CourseDto[]> =>
    http.get<CourseDto[]>('/Courses').then(res => res.data),

  getByTeacher: (teacherId: number): Promise<CourseDto[]> =>
    http.get<CourseDto[]>(`/Courses/teacher/${teacherId}`).then(res => res.data),

  getByTeacherWithoutEvaluation: (teacherId: number): Promise<CourseDto[]> =>
    http.get<CourseDto[]>(`/Courses/teacher/${teacherId}/without-evaluation`).then(res => res.data),
}
import http from '@/lib/http'
import { createService } from './base.service'
import type { Course, CourseCreateDTO, CourseUpdateDTO } from '@/types/course'

const baseService = createService<CourseCreateDTO, CourseUpdateDTO, Course>('/Courses')

export const courseService = {
  ...baseService,

  getAll: (): Promise<Course[]> =>
    http.get<Course[]>('/Courses').then(res => res.data),

  getByTeacher: (teacherId: number): Promise<Course[]> =>
    http.get<Course[]>(`/Courses/teacher/${teacherId}`).then(res => res.data),

  getByTeacherWithoutEvaluation: (teacherId: number): Promise<Course[]> =>
    http.get<Course[]>(`/Courses/teacher/${teacherId}/without-evaluation`).then(res => res.data),
}
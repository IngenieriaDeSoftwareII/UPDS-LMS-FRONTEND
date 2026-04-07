import http from '@/lib/http'
import type { Course } from '@/types/course'

export const coursePruebaService = {
  getAll: () =>
    http.get<Course[]>('/Courses').then(r => r.data),

  getById: (id: number) =>
    http.get<Course>(`/Courses/${id}`).then(r => r.data),

  create: (data: Partial<Course>) =>
    http.post<Course>('/Courses', data).then(r => r.data),

  update: (id: number, data: Partial<Course>) =>
    http.put<Course>(`/Courses/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    http.delete(`/Courses/${id}`),

  getByTeacher: (teacherId: number) =>
  http.get<Course[]>(`/Courses/teacher/${teacherId}`).then(r => r.data),
}
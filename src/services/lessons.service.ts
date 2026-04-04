import http from '@/lib/http'

export interface Lesson {
  id: number
  moduleId: number
  title: string
  description?: string
  order: number
  entityStatus: number
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

// DTO para crear
export type CreateLessonDto = {
  moduleId: number
  title: string
  description?: string
  order: number
}

// DTO para actualizar
export type UpdateLessonDto = {
  moduleId: number
  title: string
  description?: string
  order: number
}

const BASE = '/Lessons'

export const lessonsService = {
  // GET ALL
  getAll: () =>
    http.get<Lesson[]>(`${BASE}/GetAll`).then(r => r.data),

  // CREATE
  create: (data: CreateLessonDto) =>
    http.post<Lesson>(`${BASE}/Create`, data).then(r => r.data),

  // UPDATE
  update: (id: number, data: UpdateLessonDto) =>
    http.put<Lesson>(`${BASE}/Update/${id}`, data).then(r => r.data),

  // DELETE
  remove: (id: number) =>
    http.delete(`${BASE}/Delete/${id}`).then(r => r.data),
}
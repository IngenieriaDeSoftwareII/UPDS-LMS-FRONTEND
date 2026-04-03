import http from '@/lib/http'
import { createService } from './base.service'
import type { Course, CourseCreateDTO, CourseUpdateDTO } from '@/types/course'

const baseService = createService<CourseCreateDTO, CourseUpdateDTO, Course>('/Courses')

function normalizeCourse(raw: Record<string, unknown>): Course {
  return {
    id: Number(raw.id),
    titulo: String(raw.titulo ?? ''),
    descripcion: raw.descripcion as string | undefined,
    nivel: String(raw.nivel ?? ''),
    imagen_url: String((raw.imagenUrl ?? raw.imagen_url) ?? ''),
    publicado: Boolean(raw.publicado),
    duracion_total_min: Number((raw.duracionTotalMin ?? raw.duracion_total_min) ?? 0),
    max_estudiantes: (raw.maxEstudiantes ?? raw.max_estudiantes) as number | null | undefined,
    entity_status: Number(raw.entityStatus ?? raw.entity_status ?? 1),
    created_at: String(raw.createdAt ?? raw.created_at ?? ''),
    updated_at: String(raw.updatedAt ?? raw.updated_at ?? ''),
    deleted_at: (raw.deletedAt ?? raw.deleted_at) as string | null | undefined,
    docenteId:
      raw.docenteId != null || raw.docente_id != null
        ? Number(raw.docenteId ?? raw.docente_id)
        : undefined,
  }
}

export const courseService = {
  ...baseService,

  getAll: (): Promise<Course[]> =>
    http.get<Course[]>('/Courses').then(res => res.data),

  getByTeacher: (teacherId: number): Promise<Course[]> =>
    http.get<Course[]>(`/Courses/teacher/${teacherId}`).then(res => res.data),

  getByTeacherWithoutEvaluation: (teacherId: number): Promise<Course[]> =>
    http.get<Course[]>(`/Courses/teacher/${teacherId}/without-evaluation`).then(res => res.data),

  getAllNormalized: async () => {
    const { data } = await http.get<Record<string, unknown>[]>('/Courses')
    return (Array.isArray(data) ? data : []).map(normalizeCourse)
  },

  getById: async (id: number) => {
    const { data } = await http.get<Record<string, unknown>>(`/Courses/${id}`)
    return normalizeCourse(data)
  },

  getCoursesByTeacher: async (teacherId: number) => {
    const all = await courseService.getAllNormalized()
    return all.filter(c => c.docenteId === teacherId)
  },
}

import http from '@/lib/http'

export interface CreateInscriptionDto {
  usuarioId: number
  cursoId: number
}

export interface CancelInscriptionDto {
  usuarioId: number
  cursoId: number
}

export interface MyCourseDto {
  id: number
  titulo: string
  descripcion?: string
  nivel: string
  imagenUrl?: string | null
  publicado?: boolean
  duracionTotalMin?: number | null
  maxEstudiantes?: number | null
}

export interface MyCourseInscriptionDto {
  id: number
  estado: string
  fechaCompletado?: string | null
  createdAt: string
  curso: MyCourseDto
}

// SERVICE
export const inscriptionService = {

  // INSCRIBIRSE A CURSO
  async create(data: CreateInscriptionDto): Promise<unknown> {
    return http
      .post('/Inscriptions', data)
      .then(res => res.data)
  },

  // OBTENER MIS CURSOS
  async getMyCourses(usuarioId: number): Promise<MyCourseInscriptionDto[]> {
    return http
      .get<MyCourseInscriptionDto[]>(`/Inscriptions/courses?usuarioId=${usuarioId}`)
      .then(res => res.data)
  },

  // CANCELAR INSCRIPCIÓN
  async cancel(data: CancelInscriptionDto): Promise<unknown> {
    return http
      .patch('/Inscriptions/cancel', data)
      .then(res => res.data)
  }
}
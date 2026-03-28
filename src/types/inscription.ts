import type { Course } from './course'

export interface Inscription {
  id: number
  usuarioId: number
  cursoId: number
  estado: string
  curso?: Course
}
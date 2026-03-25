import type { Inscription } from '@/types/inscription'
import type { Course } from '@/types/course'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// DTOs
export interface CreateInscriptionDto {
  usuarioId: number
  cursoId: number
}

export interface CancelInscriptionDto {
  usuarioId: number
  cursoId: number
}

export interface InscriptionResponse {
  id: number
  usuarioId: number
  cursoId: number
  estado: string
  curso?: Course
}

// SERVICE
export const inscriptionService = {

  // INSCRIBIRSE A CURSO
  async create(data: CreateInscriptionDto): Promise<InscriptionResponse> {
    const response = await fetch(`${API_URL}/Inscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error?.[0] || 'Error al inscribirse')
    }

    return response.json()
  },

  // OBTENER MIS CURSOS
    async getMyCourses(usuarioId: number): Promise<InscriptionResponse[]> {
    const response = await fetch(
      `${API_URL}/Inscriptions/mis-cursos?usuarioId=${usuarioId}`
    )

    if (!response.ok) {
      throw new Error('Error al obtener cursos')
    }

    return response.json()
  },

  // CANCELAR INSCRIPCIÓN
  async cancel(data: CancelInscriptionDto): Promise<InscriptionResponse> {
    const response = await fetch(`${API_URL}/Inscriptions/cancelar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error?.[0] || 'Error al cancelar inscripción')
    }

    return response.json()
  }
}
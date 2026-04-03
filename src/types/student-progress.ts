export interface StudentLessonLearning {
  id: number
  titulo: string
  orden?: number | null
  completada: boolean
}

export interface StudentModuleLearning {
  id: number
  titulo: string
  orden: number
  lecciones: StudentLessonLearning[]
}

export interface StudentCourseLearning {
  cursoId: number
  titulo: string
  descripcion?: string | null
  nivel?: string | null
  imagenUrl?: string | null
  duracionTotalMin: number
  docenteNombre?: string | null
  categoriaNombre: string
  inscrito: boolean
  inscripcionId?: number | null
  estadoInscripcion?: string | null
  leccionesTotales: number
  leccionesCompletadas: number
  progresoPorcentaje: number
  cursoCompletado?: boolean
  tieneEvaluacionFinal?: boolean
  notaEvaluacionSobre100?: number | null
  aprobadoEvaluacionFinal?: boolean
  puedeDescargarCertificado?: boolean
  mensajeCertificado?: string | null
  modulos: StudentModuleLearning[]
}

export interface CompleteLessonResponse {
  cursoId: number
  leccionesCompletadas: number
  leccionesTotales: number
  progresoPorcentaje: number
  cursoCompletado: boolean
  estadoInscripcion?: string | null
}

export interface StudentDashboardProgress {
  cursoId: number
  titulo: string
  imagenUrl?: string | null
  estadoInscripcion: string
  fechaCompletado?: string | null
  progresoPorcentaje: number
  leccionesCompletadas: number
  leccionesTotales: number
}

export interface ModuleWeightedGrade {
  moduloId: number
  tituloModulo: string
  orden: number
  notaPonderada?: number | null
  ponderacionTotal: number
  itemsConEvaluacion: number
  itemsCalificados: number
}

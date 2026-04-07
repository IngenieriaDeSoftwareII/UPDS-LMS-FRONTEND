export interface ApiErrorResponse {
  errors?: string[]
}

export interface CreateEvaluationDto {
  id?: number
  cursoId: number
  titulo: string
  descripcion?: string
  tipo: string
  puntajeMaximo?: number
  puntajeMinimoAprobacion?: number
  intentosPermitidos: number
  tiempoLimiteMax?: number
}

export interface AddAnswerOptionDto {
  texto: string
  esCorrecta: boolean
  orden: number
}

export interface AddEvaluationQuestionDto {
  evaluacionId: number
  enunciado: string
  tipo: string
  puntos: number
  orden: number
  opciones: AddAnswerOptionDto[]
}

export interface SubmitAnswerDto {
  preguntaId: number
  opcionRespuestaId?: number
  respuestaTexto?: string
}

export interface SubmitEvaluationDto {
  evaluacionId: number
  respuestas: SubmitAnswerDto[]
}

export interface EvaluationAnswerOption {
  id: number
  texto: string
  esCorrecta?: boolean
  orden: number
}

export interface EvaluationQuestion {
  id: number
  evaluacionId: number
  enunciado: string
  tipo: string
  puntos: number
  orden: number
  opciones: EvaluationAnswerOption[]
}

export interface EvaluationQuestionToTake {
  id: number
  evaluacionId: number
  enunciado: string
  tipo: string
  puntos: number
  orden: number
  opciones: EvaluationAnswerOptionToTake[]
}

export interface EvaluationAnswerOptionToTake {
  id: number
  texto: string
  orden: number
  esCorrecta?: boolean
}

export interface Evaluation {
  id: number
  cursoId: number
  nombreCurso?: string
  titulo: string
  descripcion?: string
  tipo: string
  puntajeMaximo?: number
  puntajeMinimoAprobacion?: number
  intentosPermitidos: number
  tiempoLimiteMax?: number
  preguntas?: EvaluationQuestion[] | EvaluationQuestionToTake[]
}

export interface EvaluationSubmissionResult {
  evaluacionId: number
  intentoId: number
  numeroIntento: number
  puntajeObtenido: number
  puntajeMaximo: number
  aprobado: boolean
}

export interface StudentGrade {
  evaluacionId: number
  tituloEvaluacion: string
  intentoId: number
  numeroIntento: number
  puntajeObtenido: number
  puntajeMaximo: number
  aprobado: boolean
  fechaEnvio: string
}

export interface TeacherEvaluationGrade {
  evaluacionId: number
  tituloEvaluacion: string
  estudianteId: number
  estudianteNombreCompleto: string
  intentoId: number
  numeroIntento: number
  puntajeObtenido: number
  puntajeMaximo: number
  aprobado: boolean
  fechaEnvio: string
}

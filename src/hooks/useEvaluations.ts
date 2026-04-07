import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { evaluationService } from '@/services/evaluation.service'
import { useAuthStore } from '@/store/auth.store'
import type {
  AddEvaluationQuestionDto,
  ApiErrorResponse,
  CreateEvaluationDto,
  SubmitEvaluationDto,
} from '@/types'

export const getApiErrorMessages = (error: unknown): string[] => {
  const axiosError = error as AxiosError<ApiErrorResponse>
  const errors = axiosError?.response?.data?.errors
  if (Array.isArray(errors) && errors.length > 0) return errors

  const status = axiosError?.response?.status
  if (status === 404) {
    return [
      'No se encontró el recurso solicitado. Verifica el endpoint en backend.',
      'Para rendir examen necesitas un endpoint que devuelva la evaluación con preguntas y opciones.',
    ]
  }

  if (status === 500) {
    return ['El servidor devolvió error interno. Revisa logs del backend para el detalle.']
  }

  if (axiosError?.message) return [axiosError.message]
  return ['Ocurrió un error inesperado.']
}

export const useCreateEvaluation = () =>
  useMutation({
    mutationFn: (data: CreateEvaluationDto) => evaluationService.create(data),
  })

export const useAddEvaluationQuestion = () =>
  useMutation({
    mutationFn: (data: AddEvaluationQuestionDto) => evaluationService.addQuestion(data),
  })

export const useEvaluationByCourseId = (cursoId?: number) => {
  const { role } = useAuthStore()

  return useQuery({
    queryKey: ['evaluation', 'course', cursoId],
    queryFn: () => {
      if (role === 'Docente') {
        return evaluationService.getByCourseIdForTeacher(cursoId as number)
      }
      return evaluationService.getByCourseId(cursoId as number)
    },
    enabled: Boolean(cursoId),
  })
}

export const useSubmitEvaluation = () =>
  useMutation({
    mutationFn: (data: SubmitEvaluationDto) => evaluationService.submit(data),
  })

export const useMyEvaluationGrades = () =>
  useQuery({
    queryKey: ['evaluation-grades', 'me'],
    queryFn: evaluationService.getMyGrades,
  })

export const useUpdateEvaluation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateEvaluationDto }) => evaluationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation'] })
    },
  })
}

export const useEvaluationGradesForTeacher = (cursoId?: number) =>
  useQuery({
    queryKey: ['evaluation-grades', 'teacher', 'course', cursoId],
    queryFn: () => evaluationService.getGradesByCourseId(cursoId as number),
    enabled: Boolean(cursoId),
  })

export const useInvalidateMyGrades = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['evaluation-grades', 'me'] })
}

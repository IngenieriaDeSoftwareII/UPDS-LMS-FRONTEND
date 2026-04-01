import { useQuery } from '@tanstack/react-query'
import { evaluationService } from '@/services/evaluation.service'

export function useAvailableEvaluations() {
  return useQuery({
    queryKey: ['available-evaluations'],
    queryFn: () => evaluationService.getAvailable().then(courses =>
      courses.map(course => ({
        id: 0,
        estado: 'completado',
        fechaCompletado: null,
        createdAt: new Date().toISOString(),
        curso: course
      }))
    ),
  })
}
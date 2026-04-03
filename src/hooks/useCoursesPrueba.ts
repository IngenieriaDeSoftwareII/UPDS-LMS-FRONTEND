import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coursePruebaService } from '@/services/coursePrueba.service'
import type { Course } from '@/types/course'

export const useCoursesPrueba = () =>
  useQuery({
    queryKey: ['courses-prueba'],
    queryFn: coursePruebaService.getAll,
  })

export const useCreateCoursePrueba = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Course>) =>
      coursePruebaService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses-prueba'] })
    },
  })
}

export const useUpdateCoursePrueba = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Course> }) =>
      coursePruebaService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses-prueba'] })
    },
  })
}

export const useDeleteCoursePrueba = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => coursePruebaService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses-prueba'] })
    },
  })
}
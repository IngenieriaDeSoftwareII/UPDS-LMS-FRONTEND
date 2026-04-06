import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { moduleService } from '@/services/module.service'
import type { CreateModuleDto, UpdateModuleDto } from '@/types/module'

export const useModules = () =>
  useQuery({
    queryKey: ['modules'],
    queryFn: moduleService.getAll,
  })

export const useCreateModule = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateModuleDto) => moduleService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modules'] })
    },
  })
}

export const useUpdateModule = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateModuleDto }) =>
      moduleService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modules'] })
    },
  })
}
export const useModuleByCourseId = (courseId: number) =>
  useQuery({
    queryKey: ['modules', courseId],
    queryFn: () => moduleService.getModuleByCourseId(courseId),
  })
export const useDeleteModule = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => moduleService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modules'] })
    },
  })
}
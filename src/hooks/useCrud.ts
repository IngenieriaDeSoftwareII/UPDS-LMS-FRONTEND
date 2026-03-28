import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createService } from '@/services/base.service'

export const useCrud = <TCreate, TUpdate, TResponse>(entity: string) => {
  const service = createService<TCreate, TUpdate, TResponse>(`/${entity}`)
  const queryClient = useQueryClient()

  const useList = () =>
    useQuery({
      queryKey: [entity],
      queryFn: service.getAll,
    })

  const useCreate = () =>
    useMutation({
      mutationFn: service.create,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [entity] }),
    })

  const useUpdate = () =>
    useMutation({
      mutationFn: ({ id, data }: { id: number; data: TUpdate }) =>
        service.update(id, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [entity] }),
    })

  const useDelete = () =>
    useMutation({
      mutationFn: (id: number) => service.remove(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [entity] }),
    })

  return {
    useList,
    useCreate,
    useUpdate,
    useDelete,
  }
}
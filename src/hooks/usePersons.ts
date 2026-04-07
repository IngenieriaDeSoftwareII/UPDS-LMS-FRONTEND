import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { personService } from '@/services/person.service'
import type { CreatePersonDto, UpdatePersonDto, ChangePersonStatusDto } from '@/types/person'

export const usePersons = () =>
  useQuery({
    queryKey: ['persons'],
    queryFn: personService.getAll,
  })

export const useCreatePerson = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePersonDto) => personService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['persons'] }),
  })
}

export const useUpdatePerson = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePersonDto }) =>
      personService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['persons'] }),
  })
}

export const useChangePersonStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ChangePersonStatusDto }) =>
      personService.changeStatus(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['persons'] }),
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { personService } from '@/services/person.service'
import type { CreatePersonDto } from '@/types/person'

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

import http from '@/lib/http'
import type { PersonDto, CreatePersonDto, UpdatePersonDto } from '@/types/person'

export const personService = {
  getAll: () => http.get<PersonDto[]>('/persons').then(res => res.data),
  create: (data: CreatePersonDto) => http.post<PersonDto>('/persons', data).then(res => res.data),
  update: (id: number, data: UpdatePersonDto) =>
    http.patch<{ message: string; data: PersonDto }>(`/persons/${id}`, data).then(res => res.data.data),
}

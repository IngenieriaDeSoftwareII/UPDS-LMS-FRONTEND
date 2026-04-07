import http from '@/lib/http'
import type { PersonDto, CreatePersonDto, UpdatePersonDto, ChangePersonStatusDto } from '@/types/person'

export const personService = {
  getAll: () => http.get<PersonDto[]>('/persons/all').then(res => res.data),
  create: (data: CreatePersonDto) => http.post<PersonDto>('/persons', data).then(res => res.data),
  update: (id: number, data: UpdatePersonDto) =>
    http.patch<{ message: string; data: PersonDto }>(`/persons/${id}`, data).then(res => res.data.data),
  changeStatus: (id: number, data: ChangePersonStatusDto) =>
    http.patch<{ message: string }>(`/persons/${id}/status`, data).then(res => res.data),
}

import http from '@/lib/http'
import type { PersonDto, CreatePersonDto } from '@/types/person'

export const personService = {
  getAll: () => http.get<PersonDto[]>('/persons').then(res => res.data),
  create: (data: CreatePersonDto) => http.post<PersonDto>('/persons', data).then(res => res.data),
}

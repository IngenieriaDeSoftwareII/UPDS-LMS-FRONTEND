import http from '@/lib/http'
import type { ModuleDto, CreateModuleDto, UpdateModuleDto } from '@/types/module'

export const moduleService = {
  getAll: () =>
    http.get<ModuleDto[]>('/Modules/GetAll').then(r => r.data),

  getById: (id: number) =>
    http.get<ModuleDto>(`/Modules/GetById/${id}`).then(r => r.data),

  create: (data: CreateModuleDto) =>
    http.post<ModuleDto>('/Modules/Create', data).then(r => r.data),

  update: (id: number, data: UpdateModuleDto) =>
    http.put(`/Modules/Update/${id}`, data),

  delete: (id: number) =>
    http.delete(`/Modules/Delete/${id}`),
}
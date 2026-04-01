import http from '@/lib/http'

export const createService = <TCreate, TUpdate, TResponse>(endpoint: string) => ({
  // GET ALL
  getAll: () =>
    http.get<TResponse[]>(`${endpoint}`).then(r => r.data),

  // CREATE
  create: (data: TCreate) =>
    http.post<TResponse>(`${endpoint}`, data).then(r => r.data),

  // UPDATE
  update: (id: number, data: TUpdate) =>
    http.put<TResponse>(`${endpoint}/${id}`, data).then(r => r.data),

  // DELETE
  remove: (id: number) =>
    http.delete(`${endpoint}/${id}`).then(r => r.data),
})
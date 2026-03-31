import http from '@/lib/http'

export const createService = <TCreate, TUpdate, TResponse>(endpoint: string) => ({
  // GET ALL
  getAll: () =>
    http.get<TResponse[]>(`${endpoint}/GetAll`).then(r => r.data),

  // CREATE
  create: (data: TCreate) =>
    http.post<TResponse>(`${endpoint}/Create`, data).then(r => r.data),

  // UPDATE
  update: (id: number, data: TUpdate) =>
    http.put<TResponse>(`${endpoint}/Update/${id}`, data).then(r => r.data),

  // DELETE
  remove: (id: number) =>
    http.delete(`${endpoint}/Delete/${id}`).then(r => r.data),
})
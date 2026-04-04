import http from '@/lib/http'
import type {
    getHomeWorkDto,
    getUrlHomeWorkDto
} from '@/types/homeWork'

export const homeWorkService = {
    getAll: () =>
        http.get<getHomeWorkDto[]>('/homeworks/GetAll').then(r => r.data),

    create: (data: FormData) =>
        http.post<getHomeWorkDto>('/homeworks/Create', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(r => r.data),

    update: (id: number, data: FormData) =>
        http.put(`/homeworks/Update/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    delete: (id: number) =>
        http.delete(`/homeworks/Delete/${id}`),

    getUrl: (id: number) =>
        http.get<getUrlHomeWorkDto>(`/homeworks/GetSasUrl/${id}`).then(r => r.data),

}
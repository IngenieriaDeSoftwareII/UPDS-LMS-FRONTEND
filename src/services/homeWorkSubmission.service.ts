import http from "@/lib/http";
import type {
    homeWorkSubmissionDto,
    gradeHomeWorkDto,
    urlHomeWorkSubmissionDto
} from "@/types/homeworkSubmission";

const BASE = '/HomeworkSubmissions'

export const homeWorkSubmissionService = {
    getAll: () =>
        http.get<homeWorkSubmissionDto[]>(`${BASE}/GetAll`).then(r => r.data),

    submit: (data: FormData) =>
        http.post<homeWorkSubmissionDto>(`${BASE}/Create`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(r => r.data),

    update: (id: number, data: FormData) =>
        http.put(`${BASE}/Update/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(r => r.data),

    delete: (id: number) =>
        http.delete(`${BASE}/Delete/${id}`).then(r => r.data),

    getUrl: (id: number) =>
        http.get<urlHomeWorkSubmissionDto>(`${BASE}/GetSubmissionSasUrl/${id}`).then(r => r.data),

    grade: (data: gradeHomeWorkDto) =>
        http.post<gradeHomeWorkDto>(`${BASE}/Grade`, data).then(r => r.data),
}
import http from "@/lib/http";
import type { TeacherDto, CreateTeacherDto, UpdateTeacherDto } from "@/types/teacher";

const BASE_URL = "/Teachers";

export const teacherService = {
  getAll: (): Promise<TeacherDto[]> => 
    http.get<TeacherDto[]>(BASE_URL).then((r) => r.data),

  getById: (id: string): Promise<TeacherDto> => 
    http.get<TeacherDto>(`${BASE_URL}/${id}`).then((r) => r.data),

  create: (data: CreateTeacherDto): Promise<TeacherDto> => 
    http.post<TeacherDto>(BASE_URL, data).then((r) => r.data),

  update: (id: string, data: UpdateTeacherDto): Promise<void> => 
    http.put<void>(`${BASE_URL}/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<void> => 
    http.delete<void>(`${BASE_URL}/${id}`).then((r) => r.data),
};

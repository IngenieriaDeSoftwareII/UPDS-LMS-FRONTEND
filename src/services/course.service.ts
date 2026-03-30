import http from "@/lib/http";
import type { CourseDto, CreateCourseDto, UpdateCourseDto } from "@/types/course";

const BASE_URL = "/Courses";

export const courseService = {
  getAll: (): Promise<CourseDto[]> => 
    http.get<CourseDto[]>(BASE_URL).then((r) => r.data),

  getById: (id: string): Promise<CourseDto> => 
    http.get<CourseDto>(`${BASE_URL}/${id}`).then((r) => r.data),

  create: (data: CreateCourseDto): Promise<CourseDto> => 
    http.post<CourseDto>(BASE_URL, data).then((r) => r.data),

  update: (id: string, data: UpdateCourseDto): Promise<void> => 
    http.put<void>(`${BASE_URL}/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<void> => 
    http.delete<void>(`${BASE_URL}/${id}`).then((r) => r.data),
};
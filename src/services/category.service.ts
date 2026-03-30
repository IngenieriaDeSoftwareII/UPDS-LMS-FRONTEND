import http from "@/lib/http";
import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from "@/types/category";

const BASE_URL = "/Categories";

export const categoryService = {
  getAll: (): Promise<CategoryDto[]> => 
    http.get<CategoryDto[]>(BASE_URL).then((r) => r.data),

  getById: (id: string): Promise<CategoryDto> => 
    http.get<CategoryDto>(`${BASE_URL}/${id}`).then((r) => r.data),

  create: (data: CreateCategoryDto): Promise<CategoryDto> => 
    http.post<CategoryDto>(BASE_URL, data).then((r) => r.data),

  update: (id: string, data: UpdateCategoryDto): Promise<void> => 
    http.put<void>(`${BASE_URL}/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<void> => 
    http.delete<void>(`${BASE_URL}/${id}`).then((r) => r.data),
};

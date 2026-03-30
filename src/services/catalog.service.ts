import http from "@/lib/http";
import type { CatalogDto, CreateCatalogDto, UpdateCatalogDto } from "@/types/catalog";

const BASE_URL = "/Catalogs";

export const catalogService = {
  getAll: (): Promise<CatalogDto[]> => 
    http.get<CatalogDto[]>(BASE_URL).then((r) => r.data),

  getById: (id: string): Promise<CatalogDto> => 
    http.get<CatalogDto>(`${BASE_URL}/${id}`).then((r) => r.data),

  create: (data: CreateCatalogDto): Promise<CatalogDto> => 
    http.post<CatalogDto>(BASE_URL, data).then((r) => r.data),

  update: (id: string, data: UpdateCatalogDto): Promise<void> => 
    http.put<void>(`${BASE_URL}/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<void> => 
    http.delete<void>(`${BASE_URL}/${id}`).then((r) => r.data),
};

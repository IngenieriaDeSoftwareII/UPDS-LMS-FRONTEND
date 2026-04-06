import http from '@/lib/http'
import { createService } from './base.service';
import type { Catalog, CatalogCreateDTO, CatalogUpdateDTO } from '@/types/catalog';

const baseService = createService<CatalogCreateDTO, CatalogUpdateDTO, Catalog>('/catalogs')

export const catalogService = {
	...baseService,
	update: (id: number, data: CatalogUpdateDTO) =>
		http.put<Catalog>(`/catalogs/${id}`, data).then(r => r.data),
}

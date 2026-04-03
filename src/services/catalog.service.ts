import { createService } from './base.service';
import type { Catalog, CatalogCreateDTO, CatalogUpdateDTO } from '@/types/catalog';

export const catalogService = createService<CatalogCreateDTO, CatalogUpdateDTO, Catalog>('/catalogs');

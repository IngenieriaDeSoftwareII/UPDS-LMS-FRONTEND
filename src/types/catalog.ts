import type { CategoryDto } from './category';

export interface CatalogDto {
  id: string;
  name: string;
  description: string;
  categories?: CategoryDto[];
}

export interface CreateCatalogDto {
  name: string;
  description: string;
}

export interface UpdateCatalogDto extends Partial<CreateCatalogDto> {
  id: string;
}

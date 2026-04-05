export interface Catalog {
  id: number;
  nombre: string;
  tipo: string;
  valor: string;
  descripcion?: string;
  categoriaIds?: number[];
  categorias?: Array<{ id: number; nombre: string }>;
  entity_status: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CatalogCreateDTO {
  nombre: string;
  tipo: string;
  valor: string;
  descripcion?: string;
  categoriaIds?: number[];
}

export interface CatalogUpdateDTO extends Partial<CatalogCreateDTO> {
  id?: number;
}

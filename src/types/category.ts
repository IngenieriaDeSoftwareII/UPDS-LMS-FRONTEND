export interface Category {
  id: number;
  nombre: string;
  descripcion?: string;
  catalogoId?: number | null;
  cursoIds?: number[];
  cursos?: Array<{ id: number; titulo: string }>;
  Cursos?: Array<{ id: number; titulo: string }>;
  entity_status: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CategoryCreateDTO {
  nombre: string;
  descripcion?: string;
  catalogoId?: number | null;
  cursoIds?: number[];
}

export interface CategoryUpdateDTO extends Partial<CategoryCreateDTO> {}

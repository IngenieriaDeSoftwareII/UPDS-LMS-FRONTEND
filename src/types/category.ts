export interface Category {
  id: number;
  nombre: string;
  descripcion?: string;
  entity_status: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CategoryCreateDTO {
  nombre: string;
  descripcion?: string;
}

export interface CategoryUpdateDTO extends Partial<CategoryCreateDTO> {}

export interface Course {
  id: number;
  titulo: string;
  descripcion?: string;
  nivel: string;
  imagen_url: string;
  docenteId?: number | null;
  categoriaId?: number | null;
  publicado: boolean;
  duracion_total_min: number;
  max_estudiantes?: number | null;
  entity_status: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CourseCreateDTO {
  titulo: string;
  descripcion?: string;
  nivel: string;
  imagen_url: string;
  docente_id?: number | null;
  categoriaId?: number | null;
  publicado: boolean;
  duracion_total_min: number;
  max_estudiantes?: number | null;
}

export interface CourseUpdateDTO extends Partial<CourseCreateDTO> {}
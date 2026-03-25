//PROVISIONAL
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
}

export interface Teacher {
  id: number;
  usuario_id: number;
  especialidad?: string;
  biografia?: string;
  total_cursos: number;
  entity_status: number;
  created_at: string;

  user: User;
}

export interface Category {
  id: number;
  nombre: string;
}

export interface Course {
  id: number;
  titulo: string;
  descripcion?: string;
  docente_id: number;
  nivel: string;
  categoria_id: number;
  imagen_url: string;
  publicado: boolean;
  duracion_total_min: number;
  max_estudiantes?: number | null;
  entity_status: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  docente: Teacher;
  categoria: Category;
}
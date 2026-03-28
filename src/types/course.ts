//PROVISIONAL
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
}

export interface Course {
  id: number;
  titulo: string;
  descripcion?: string;
  nivel: string;
  imagen_url: string;
  publicado: boolean;
  duracion_total_min: number;
  max_estudiantes?: number | null;
  entity_status: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}
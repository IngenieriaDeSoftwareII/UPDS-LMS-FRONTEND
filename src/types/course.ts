export interface CourseDto {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  level: string;
  categoryId: string;
  imageUrl?: string;
  isPublished: boolean;
  totalDurationMin: number;
  maxStudents: number;
}

export interface CreateCourseDto {
  title: string;
  description: string;
  teacherId: string;
  level: string;
  categoryId: string;
  imageUrl?: string;
  isPublished: boolean;
  totalDurationMin: number;
  maxStudents: number;
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {
  id: string;
}

// PROVISIONAL: Mantenido para no romper las interfaces existentes mientras se migran las vistas
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

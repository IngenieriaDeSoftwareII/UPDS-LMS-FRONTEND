export interface Teacher {
  id: number;
  usuarioId: string;
  especialidad: string;
  biografia?: string;
  anios_experiencia: number;
  entity_status: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface TeacherCreateDTO {
  usuarioId: string;
  especialidad: string;
  biografia?: string;
  anios_experiencia: number;
}

export interface TeacherUpdateDTO extends Partial<TeacherCreateDTO> {}

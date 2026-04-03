export interface Teacher {
  id: number;
  usuario_id: number;
  especialidad: string;
  biografia?: string;
  anios_experiencia: number;
  entity_status: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface TeacherCreateDTO {
  usuario_id: number;
  especialidad: string;
  biografia?: string;
  anios_experiencia: number;
}

export interface TeacherUpdateDTO extends Partial<TeacherCreateDTO> {}

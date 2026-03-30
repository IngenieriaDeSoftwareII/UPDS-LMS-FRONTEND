export interface TeacherDto {
  id: string;
  userId: string;
  specialty: string;
  biography: string;
}

export interface CreateTeacherDto {
  userId: string;
  specialty: string;
  biography: string;
}

export interface UpdateTeacherDto extends Partial<CreateTeacherDto> {
  id: string;
}

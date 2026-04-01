import { createService } from './base.service';
import type { Teacher, TeacherCreateDTO, TeacherUpdateDTO } from '@/types/teacher';

export const teacherService = createService<TeacherCreateDTO, TeacherUpdateDTO, Teacher>('/teachers');

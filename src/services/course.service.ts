import { createService } from './base.service';
import type { Course, CourseCreateDTO, CourseUpdateDTO } from '@/types/course';

export const courseService = createService<CourseCreateDTO, CourseUpdateDTO, Course>('/courses');

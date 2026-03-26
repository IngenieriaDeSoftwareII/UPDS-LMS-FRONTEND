import { createService } from './base.service'

export interface Lesson {
  id: number
  courseId: number
  title: string
  description?: string
  order: number
  entityStatus: number
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface LessonDto {
  courseId: number
  title: string
  description?: string
  order: number
}

export const lessonsService = createService<
  LessonDto,
  LessonDto,
  Lesson
>('Lessons')
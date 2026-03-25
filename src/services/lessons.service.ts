import { createService } from './base.service'

export interface Lesson {
  id: number
  moduleId: number
  title: string
  description: string
  order: number
}

export interface LessonDto {
  moduleId: number
  title: string
  description: string
  order: number
}

export const lessonsService = createService<
  LessonDto,
  LessonDto,
  Lesson
>('Lessons')
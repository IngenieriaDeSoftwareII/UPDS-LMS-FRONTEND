import { useCrud } from './useCrud'

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
  id?: number
  courseId: number
  title: string
  description?: string
  order: number
}

export const useLessons = () => {
  const crud = useCrud<LessonDto, LessonDto, Lesson>('Lessons')

  return {
    useLessonsList: crud.useList,
    useCreateLesson: crud.useCreate,
    useUpdateLesson: crud.useUpdate,
    useDeleteLesson: crud.useDelete,
  }
}
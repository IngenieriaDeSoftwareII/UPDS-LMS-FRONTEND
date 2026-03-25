import { useCrud } from './useCrud'

export interface LessonDto {
  id?: number
  moduleId: number
  title: string
  description: string
  order: number
}

export const useLessons = () => {
  const crud = useCrud<LessonDto, LessonDto, LessonDto>('Lessons')

  return {
    useLessonsList: crud.useList,
    useCreateLesson: crud.useCreate,
    useUpdateLesson: crud.useUpdate,
    useDeleteLesson: crud.useDelete,
  }
}
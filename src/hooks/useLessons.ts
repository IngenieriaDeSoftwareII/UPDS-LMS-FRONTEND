import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { lessonsService } from '@/services/lessons.service'
import type { CreateLessonDto, UpdateLessonDto } from '@/services/lessons.service'

export const useLessons = () => {
  const queryClient = useQueryClient()

  const useLessonsList = () =>
    useQuery({
      queryKey: ['Lessons'],
      queryFn: lessonsService.getAll,
    })

  const useCreateLesson = () =>
    useMutation({
      mutationFn: (data: CreateLessonDto) => lessonsService.create(data),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['Lessons'] }),
    })

  const useUpdateLesson = () =>
    useMutation({
      mutationFn: ({ id, data }: { id: number; data: UpdateLessonDto }) =>
        lessonsService.update(id, data),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['Lessons'] }),
    })

  const useDeleteLesson = () =>
    useMutation({
      mutationFn: (id: number) => lessonsService.remove(id),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['Lessons'] }),
    })

  const useLessonByCourseAndModule = (courseId: number, moduleId: number) =>
    useQuery({
      queryKey: ['Lessons', courseId, moduleId],
      queryFn: () => lessonsService.getLessonByCourseAndModule(courseId, moduleId),
    })

  return {
    useLessonsList,
    useCreateLesson,
    useUpdateLesson,
    useDeleteLesson,
    useLessonByCourseAndModule,
  }
}
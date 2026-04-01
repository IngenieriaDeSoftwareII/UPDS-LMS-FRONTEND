import { useQuery } from '@tanstack/react-query'
import { courseService } from '@/services/course.service'
import { useTeacherProfile } from './useTeacherProfile'

export function useCoursesWithoutEvaluation() {
  const teacherProfileQuery = useTeacherProfile()

  return useQuery({
    queryKey: ['courses-without-evaluation', teacherProfileQuery.data?.teacherId],
    queryFn: () => courseService.getByTeacherWithoutEvaluation(teacherProfileQuery.data?.teacherId ?? 0),
    enabled: Boolean(teacherProfileQuery.data?.teacherId),
  })
}
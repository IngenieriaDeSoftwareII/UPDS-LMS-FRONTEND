import { useQuery } from '@tanstack/react-query'
import { courseService } from '@/services/course.service'

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.getAll(),
  })
}
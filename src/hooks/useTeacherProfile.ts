import { useQuery } from '@tanstack/react-query'
import http from '@/lib/http'

interface TeacherProfile {
  teacherId: number
  firstName: string
  lastName: string
  especialidad?: string
  biografia?: string
}

export function useTeacherProfile() {
  return useQuery({
    queryKey: ['teacher-profile'],
    queryFn: () => http.get<TeacherProfile>('/Profile/teacher').then(res => res.data),
  })
}
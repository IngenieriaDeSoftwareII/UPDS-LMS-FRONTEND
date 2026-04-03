import { useQuery } from '@tanstack/react-query'
import { inscriptionService } from '@/services/inscription.service'
import { courseService } from '@/services/course.service'
import { useCurrentProfile } from './useCurrentProfile'
import { useTeacherProfile } from './useTeacherProfile'
import { useAuthStore } from '@/store/auth.store'

export function useMyCourses() {
  const profileQuery = useCurrentProfile()
  const teacherProfileQuery = useTeacherProfile()
  const role = useAuthStore(state => state.role)

  return useQuery({
    queryKey: ['my-courses', teacherProfileQuery.data?.teacherId, profileQuery.data?.personId, role],
    queryFn: () => {
      if (role === 'Docente') {
        return courseService.getByTeacher(teacherProfileQuery.data?.teacherId ?? 0)
          .then(courses => courses.map(course => ({
            id: 0,
            estado: 'activo',
            fechaCompletado: null,
            createdAt: new Date().toISOString(),
            curso: course
          })))
      } else {
        return inscriptionService.getMyCourses(profileQuery.data?.personId ?? 0)
      }
    },
    enabled: (role === 'Docente' && Boolean(teacherProfileQuery.data?.teacherId)) || (role !== 'Docente' && Boolean(profileQuery.data?.personId)),
  })
}

export function useMyCompletedCourses() {
  const myCoursesQuery = useMyCourses()

  const completedCourses = (myCoursesQuery.data ?? []).filter(course => {
    const estado = (course.estado ?? '').trim().toLowerCase()
    return (
      estado === 'terminado' ||
      estado === 'completado' ||
      estado === 'finalizado' ||
      Boolean(course.fechaCompletado)
    )
  })

  return {
    ...myCoursesQuery,
    data: completedCourses,
  }
}

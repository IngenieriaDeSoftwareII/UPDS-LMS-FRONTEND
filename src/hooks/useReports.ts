import { useQuery } from '@tanstack/react-query'
import { reportsService } from '@/services/reports.service'

export const useAdminCoursesReport = (params: {
  from?: string
  to?: string
  categoryId?: number
  teacherId?: number
  published?: boolean
}) =>
  useQuery({
    queryKey: ['reports', 'admin', 'courses', params],
    queryFn: () => reportsService.adminCourses(params),
  })

export const useAdminTeachersReport = (params: { from?: string; to?: string; categoryId?: number }) =>
  useQuery({
    queryKey: ['reports', 'admin', 'teachers', params],
    queryFn: () => reportsService.adminTeachers(params),
  })

export const useTeacherSummaryReport = (params: { from?: string; to?: string }) =>
  useQuery({
    queryKey: ['reports', 'teacher', 'summary', params],
    queryFn: () => reportsService.teacherSummary(params),
  })

export const useTeacherCoursesReport = (params: { from?: string; to?: string; published?: boolean }) =>
  useQuery({
    queryKey: ['reports', 'teacher', 'courses', params],
    queryFn: () => reportsService.teacherCourses(params),
  })

export const useTeacherCourseDetailReport = (courseId: number, params: { from?: string; to?: string }) =>
  useQuery({
    queryKey: ['reports', 'teacher', 'courses', courseId, params],
    queryFn: () => reportsService.teacherCourseDetail(courseId, params),
    enabled: Number.isFinite(courseId),
  })


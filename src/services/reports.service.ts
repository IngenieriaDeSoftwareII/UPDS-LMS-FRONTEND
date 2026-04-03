import http from '@/lib/http'
import type {
  AdminCoursesReport,
  AdminTeachersReport,
  TeacherCourseDetailReport,
  TeacherCoursesReport,
  TeacherSummaryReport,
} from '@/types/reports'

export type ReportFormat = 'xlsx' | 'pdf'

export type DateRangeQuery = {
  from?: string
  to?: string
}

export const reportsService = {
  adminCourses: (params: DateRangeQuery & { categoryId?: number; teacherId?: number; published?: boolean }) =>
    http.get<AdminCoursesReport>('/reports/admin/courses', { params }).then(r => r.data),

  exportAdminCourses: (format: ReportFormat, params: DateRangeQuery & { categoryId?: number; teacherId?: number; published?: boolean }) =>
    http.get('/reports/admin/courses/export', { params: { format, ...params }, responseType: 'blob' }),

  adminTeachers: (params: DateRangeQuery & { categoryId?: number }) =>
    http.get<AdminTeachersReport>('/reports/admin/teachers', { params }).then(r => r.data),

  exportAdminTeachers: (format: ReportFormat, params: DateRangeQuery & { categoryId?: number }) =>
    http.get('/reports/admin/teachers/export', { params: { format, ...params }, responseType: 'blob' }),

  teacherSummary: (params: DateRangeQuery) =>
    http.get<TeacherSummaryReport>('/reports/teacher/summary', { params }).then(r => r.data),

  exportTeacherSummary: (format: ReportFormat, params: DateRangeQuery) =>
    http.get('/reports/teacher/summary/export', { params: { format, ...params }, responseType: 'blob' }),

  teacherCourses: (params: DateRangeQuery & { published?: boolean }) =>
    http.get<TeacherCoursesReport>('/reports/teacher/courses', { params }).then(r => r.data),

  exportTeacherCourses: (format: ReportFormat, params: DateRangeQuery & { published?: boolean }) =>
    http.get('/reports/teacher/courses/export', { params: { format, ...params }, responseType: 'blob' }),

  teacherCourseDetail: (courseId: number, params: DateRangeQuery) =>
    http.get<TeacherCourseDetailReport>(`/reports/teacher/courses/${courseId}`, { params }).then(r => r.data),

  exportTeacherCourseDetail: (courseId: number, format: ReportFormat, params: DateRangeQuery) =>
    http.get(`/reports/teacher/courses/${courseId}/export`, { params: { format, ...params }, responseType: 'blob' }),
}


export type ReportMonthCount = {
  year: number
  month: number
  count: number
}

export type CourseReportRow = {
  courseId: number
  title: string
  teacherId?: number | null
  teacherName?: string | null
  totalEnrollments: number
  totalCancellations: number
  totalCompletions: number
  completionRate: number
}

export type AdminCoursesReport = {
  from: string
  to: string
  courses: CourseReportRow[]
  enrollmentsByMonth: ReportMonthCount[]
}

export type TeacherCourseSummaryRow = {
  courseId: number
  title: string
  published: boolean
  createdAt: string
  totalEnrollments: number
  totalCancellations: number
  totalCompletions: number
  completionRate: number
}

export type AdminTeacherReportRow = {
  teacherId: number
  teacherName: string
  totalCourses: number
  totalEnrollments: number
  totalCancellations: number
  totalCompletions: number
  completionRate: number
  enrollmentsByMonth: ReportMonthCount[]
  courses: TeacherCourseSummaryRow[]
}

export type AdminTeachersReport = {
  from: string
  to: string
  teachers: AdminTeacherReportRow[]
}

export type TeacherSummaryReport = {
  from: string
  to: string
  teacherId: number
  teacherName: string
  totalCourses: number
  totalEnrollments: number
  totalCancellations: number
  totalCompletions: number
  completionRate: number
  enrollmentsByMonth: ReportMonthCount[]
}

export type TeacherCoursesReport = {
  from: string
  to: string
  teacherId: number
  teacherName: string
  courses: TeacherCourseSummaryRow[]
}

export type TeacherCourseDetailReport = {
  from: string
  to: string
  teacherId: number
  teacherName: string
  courseId: number
  courseTitle: string
  totalEnrollments: number
  totalCancellations: number
  totalCompletions: number
  completionRate: number
  enrollmentsByMonth: ReportMonthCount[]
}


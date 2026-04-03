import http from '@/lib/http'
import type { Course } from '@/types/course'
import type {
  AddEvaluationQuestionDto,
  CreateEvaluationDto,
  Evaluation,
  EvaluationQuestion,
  EvaluationSubmissionResult,
  StudentGrade,
  SubmitEvaluationDto,
  TeacherEvaluationGrade,
} from '@/types'

export const evaluationService = {
  create: (data: CreateEvaluationDto) =>
    http.post<Evaluation>('/Evaluations', data).then(res => res.data),

  addQuestion: (data: AddEvaluationQuestionDto) =>
    http.post<EvaluationQuestion>('/Evaluations/questions', data).then(res => res.data),

  getByCourseId: (cursoId: number) =>
    http.get<Evaluation>(`/Evaluations/by-course/${cursoId}`).then(res => res.data),

  getAvailable: () =>
    http.get<Course[]>('/Evaluations/available').then(res => res.data),

  submit: (data: SubmitEvaluationDto) =>
    http.post<EvaluationSubmissionResult>('/Evaluations/submit', data).then(res => res.data),

  getMyGrades: () =>
    http.get<StudentGrade[]>('/Evaluations/my-grades').then(res => res.data),

  getGradesByCourseId: (cursoId: number) =>
    http.get<TeacherEvaluationGrade[]>(`/Evaluations/by-course/${cursoId}/grades`).then(res => res.data),
}

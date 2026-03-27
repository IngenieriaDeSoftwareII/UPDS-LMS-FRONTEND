import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { getApiErrorMessages, useEvaluationByCourseId, useInvalidateMyGrades, useSubmitEvaluation } from '@/hooks/useEvaluations'
import type { SubmitAnswerDto } from '@/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export function SubmitEvaluationPage() {
  const { cursoId } = useParams()
  const navigate = useNavigate()
  const parsedCursoId = Number(cursoId)

  const [answersByQuestion, setAnswersByQuestion] = useState<Record<number, number>>({})
  const [backendErrors, setBackendErrors] = useState<string[]>([])

  const evaluationQuery = useEvaluationByCourseId(Number.isNaN(parsedCursoId) ? undefined : parsedCursoId)
  const submitEvaluation = useSubmitEvaluation()
  const invalidateGrades = useInvalidateMyGrades()

  const questions = evaluationQuery.data?.preguntas ?? []
  const allAnswered = useMemo(
    () => questions.length > 0 && questions.every(question => answersByQuestion[question.id]),
    [answersByQuestion, questions]
  )

  const onSubmit = () => {
    if (!allAnswered) {
      setBackendErrors(['Debes responder todas las preguntas de la evaluación.'])
      return
    }

    const respuestas: SubmitAnswerDto[] = questions.map(question => ({
      preguntaId: question.id,
      opcionRespuestaId: answersByQuestion[question.id],
    }))

    const evaluationId = evaluationQuery.data?.id
    if (!evaluationId) {
      setBackendErrors(['No se pudo identificar la evaluación para este curso.'])
      return
    }

    submitEvaluation.mutate(
      { evaluacionId: evaluationId, respuestas },
      {
        onSuccess: result => {
          invalidateGrades()
          navigate(`/student/evaluations/${parsedCursoId}/result`, { state: { result } })
        },
        onError: error => setBackendErrors(getApiErrorMessages(error)),
      }
    )
  }

  if (evaluationQuery.isLoading) return <div className="p-6">Cargando evaluación...</div>

  if (evaluationQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No se pudo cargar la evaluación</AlertTitle>
        <AlertDescription>{getApiErrorMessages(evaluationQuery.error).join(' ')}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rendir evaluación</h1>
          <p className="text-sm text-muted-foreground">{evaluationQuery.data?.titulo ?? 'Evaluación final'}</p>
        </div>
      </div>

      {backendErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo enviar</AlertTitle>
          <AlertDescription>{backendErrors.join(' ')}</AlertDescription>
        </Alert>
      )}

      {questions.length === 0 ? (
        <Alert>
          <AlertTitle>No hay datos para rendir</AlertTitle>
          <AlertDescription>
            No hay preguntas disponibles para este curso o el endpoint `GET /Evaluations/by-course/{cursoId}` no está habilitado.
          </AlertDescription>
        </Alert>
      ) : (
        questions.map(question => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-base">{question.orden}. {question.enunciado}</CardTitle>
              <CardDescription>{question.puntos} punto(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answersByQuestion[question.id] ? String(answersByQuestion[question.id]) : undefined}
                onValueChange={value =>
                  setAnswersByQuestion(prev => ({ ...prev, [question.id]: Number(value) }))
                }
              >
                {question.opciones
                  .sort((a, b) => a.orden - b.orden)
                  .map(option => (
                    <div key={option.id} className="flex items-center gap-2 border rounded-md p-3">
                      <RadioGroupItem value={String(option.id)} id={`option-${option.id}`} />
                      <label htmlFor={`option-${option.id}`} className="cursor-pointer">{option.texto}</label>
                    </div>
                  ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))
      )}

      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={!allAnswered || submitEvaluation.isPending}>
          {submitEvaluation.isPending ? 'Enviando...' : 'Enviar evaluación'}
        </Button>
      </div>
    </div>
  )
}

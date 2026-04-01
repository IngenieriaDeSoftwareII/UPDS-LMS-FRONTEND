import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { getApiErrorMessages, useEvaluationByCourseId, useInvalidateMyGrades, useSubmitEvaluation } from '@/hooks/useEvaluations'
import { useEvaluationTimer } from '@/hooks/useEvaluationTimer'
import { QuestionCard } from '@/components/evaluations/QuestionCard'
import { TimerDisplay } from '@/components/evaluations/TimerDisplay'
import { ProgressBar } from '@/components/evaluations/ProgressBar'
import { SubmitReviewModal } from '@/components/evaluations/SubmitReviewModal'
import type { SubmitAnswerDto } from '@/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function SubmitEvaluationPage() {
  const { cursoId } = useParams()
  const navigate = useNavigate()
  const parsedCursoId = Number(cursoId)

  const [answersByQuestion, setAnswersByQuestion] = useState<Record<number, number>>({})
  const [backendErrors, setBackendErrors] = useState<string[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const evaluationQuery = useEvaluationByCourseId(Number.isNaN(parsedCursoId) ? undefined : parsedCursoId)
  const submitEvaluation = useSubmitEvaluation()
  const invalidateGrades = useInvalidateMyGrades()

  const questions = evaluationQuery.data?.preguntas ?? []
  const currentQuestion = questions[currentQuestionIndex]

  // Timer: convertir minutos a segundos (o 60 minutos por defecto)
  const tiempoLimiteSeconds = (evaluationQuery.data?.tiempoLimiteMax ?? 60) * 60
  const timer = useEvaluationTimer({
    maxSeconds: tiempoLimiteSeconds,
    onTimeUp: handleTimeUp,
  })

  const answeredCount = Object.keys(answersByQuestion).length

  function handleTimeUp() {
    setBackendErrors(['Se acabó el tiempo. Se enviará la evaluación con las respuestas actuales.'])
    handleSubmit()
  }

  function handlePreviousQuestion() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  function handleNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  function handleAnswerChange(optionId: number) {
    if (currentQuestion) {
      setAnswersByQuestion(prev => ({
        ...prev,
        [currentQuestion.id]: optionId,
      }))
    }
  }

  function handleReviewClick() {
    setShowReviewModal(true)
  }

  function handleSubmit() {
    // Validar solo preguntas respondidas (no todas)
    const respuestas: SubmitAnswerDto[] = questions
      .filter(q => answersByQuestion[q.id])
      .map(question => ({
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
          timer.pause()
          invalidateGrades()
          navigate(`/student/evaluations/${parsedCursoId}/result`, { state: { result } })
        },
        onError: error => setBackendErrors(getApiErrorMessages(error)),
      }
    )
  }

  if (evaluationQuery.isLoading) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p className="mb-2">Cargando evaluación...</p>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </Card>
    )
  }

  if (evaluationQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No se pudo cargar la evaluación</AlertTitle>
        <AlertDescription>{getApiErrorMessages(evaluationQuery.error).join(' ')}</AlertDescription>
      </Alert>
    )
  }

  if (questions.length === 0) {
    return (
      <Alert>
        <AlertTitle>No hay datos para rendir</AlertTitle>
        <AlertDescription>
          No hay preguntas disponibles para este curso.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con Timer */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{evaluationQuery.data?.titulo}</h1>
            <p className="text-sm text-muted-foreground">{evaluationQuery.data?.descripcion}</p>
          </div>
        </div>

        {/* Timer */}
        {evaluationQuery.data?.tiempoLimiteMax && (
          <div className="flex-shrink-0">
            <TimerDisplay maxSeconds={tiempoLimiteSeconds} />
          </div>
        )}
      </div>

      {/* Progreso */}
      <Card className="border-0 shadow-sm">
        <div className="p-4">
          <ProgressBar
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            answeredQuestions={answeredCount}
          />
        </div>
      </Card>

      {/* Errores */}
      {backendErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Atención</AlertTitle>
          <AlertDescription>{backendErrors.join(' ')}</AlertDescription>
        </Alert>
      )}

      {/* Pregunta Actual */}
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          selectedAnswerId={answersByQuestion[currentQuestion.id]}
          onAnswerChange={handleAnswerChange}
        />
      )}

      {/* Navegación */}
      <div className="flex gap-3 justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <Button
          onClick={handleReviewClick}
          variant="secondary"
        >
          Revisar respuestas
        </Button>

        <Button
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          Siguiente
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Modal de Revisión */}
      <SubmitReviewModal
        isOpen={showReviewModal}
        questions={questions}
        answers={answersByQuestion}
        onConfirm={() => {
          setShowReviewModal(false)
          handleSubmit()
        }}
        onCancel={() => setShowReviewModal(false)}
        isSubmitting={submitEvaluation.isPending}
      />
    </div>
  )
}

import { Progress } from '@/components/ui/progress'

interface ProgressBarProps {
  currentQuestion: number
  totalQuestions: number
  answeredQuestions: number
}

export function ProgressBar({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
}: ProgressBarProps) {
  const progressPercentage = (currentQuestion / totalQuestions) * 100
  const answeredPercentage = (answeredQuestions / totalQuestions) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            Pregunta {currentQuestion} de {totalQuestions}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {answeredQuestions} respondidas
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-primary">
            {Math.round(progressPercentage)}%
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-xs text-muted-foreground text-center">
          Progreso general de respuestas: {answeredPercentage.toFixed(0)}%
        </p>
      </div>
    </div>
  )
}

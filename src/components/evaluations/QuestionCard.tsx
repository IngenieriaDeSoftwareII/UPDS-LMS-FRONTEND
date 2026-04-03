import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import type { EvaluationQuestion } from '@/types'

interface QuestionCardProps {
  question: EvaluationQuestion
  questionNumber: number
  selectedAnswerId?: number
  onAnswerChange: (optionId: number) => void
  isReviewMode?: boolean
}

export function QuestionCard({
  question,
  questionNumber,
  selectedAnswerId,
  onAnswerChange,
  isReviewMode = false,
}: QuestionCardProps) {
  const optionsToDisplay = useMemo(() => {
    if (isReviewMode) {
      return question.opciones.sort((a, b) => a.orden - b.orden)
    } else {
      return [...question.opciones].sort(() => Math.random() - 0.5)
    }
  }, [question.opciones, isReviewMode])

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">
              Pregunta {questionNumber}
            </CardTitle>
            <p className="mt-2 text-base font-medium leading-relaxed">
              {question.enunciado}
            </p>
          </div>
          <div className="flex-shrink-0 rounded-full bg-primary/10 px-3 py-1">
            <span className="text-sm font-semibold text-primary">
              {question.puntos} {question.puntos === 1 ? 'punto' : 'puntos'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <RadioGroup
          value={selectedAnswerId ? String(selectedAnswerId) : undefined}
          onValueChange={value => onAnswerChange(Number(value))}
          disabled={isReviewMode}
        >
          <div className="space-y-3">
            {optionsToDisplay.map((option, index) => (
              <div
                key={option.id}
                className="flex items-center gap-3 rounded-lg border border-input p-4 transition-colors hover:bg-accent hover:border-primary cursor-pointer"
              >
                <RadioGroupItem
                  value={String(option.id)}
                  id={`option-${option.id}`}
                  className="mt-1"
                />
                <Label
                  htmlFor={`option-${option.id}`}
                  className="flex-1 cursor-pointer font-normal"
                >
                  <span className="font-semibold text-muted-foreground mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option.texto}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

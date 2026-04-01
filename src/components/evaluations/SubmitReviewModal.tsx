import { AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import type { EvaluationQuestion } from '@/types'

interface SubmitReviewModalProps {
  isOpen: boolean
  questions: EvaluationQuestion[]
  answers: Record<number, number>
  onConfirm: () => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function SubmitReviewModal({
  isOpen,
  questions,
  answers,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: SubmitReviewModalProps) {
  const answeredCount = Object.keys(answers).length
  const totalQuestions = questions.length
  const allAnswered = answeredCount === totalQuestions

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {allAnswered ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                ¡Listo para enviar!
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Revisión antes de enviar
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {allAnswered
              ? 'Todas las preguntas han sido respondidas. Haz clic en "Enviar" para confirmar.'
              : `Tienes ${totalQuestions - answeredCount} pregunta(s) sin responder. Puedes enviar así o volver a responder.`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-96 w-full rounded-md border p-4">
          <div className="space-y-3">
            {questions.map((question, index) => {
              const isAnswered = answers[question.id]
              const selectedOption = question.opciones.find(opt => opt.id === answers[question.id])

              return (
                <div key={question.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">
                        P{index + 1}. {question.enunciado}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {question.puntos} {question.puntos === 1 ? 'punto' : 'puntos'}
                      </p>
                    </div>
                    {isAnswered ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-1" />
                    )}
                  </div>

                  {isAnswered ? (
                    <Badge variant="default" className="w-fit">
                      {selectedOption?.texto || 'Opción seleccionada'}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="w-fit">
                      Sin responder
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Volver a responder
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar evaluación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

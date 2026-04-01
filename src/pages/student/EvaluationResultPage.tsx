import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import type { EvaluationSubmissionResult } from '@/types'
import { ResultVisualization } from '@/components/evaluations/ResultVisualization'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface LocationState {
  result?: EvaluationSubmissionResult
}

export function EvaluationResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState
  const result = state?.result

  if (!result) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTitle>Resultado no disponible</AlertTitle>
          <AlertDescription>
            Primero debes rendir una evaluación para ver este resumen.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/student/evaluations')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a mis evaluaciones
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resultado de tu evaluación</h1>
          <p className="text-muted-foreground mt-1">Intento #{result.numeroIntento}</p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Evaluación ID: {result.evaluacionId}</p>
        </div>
      </div>

      <ResultVisualization result={result} />

      <div className="flex gap-2 pt-4">
        <Button onClick={() => navigate('/student/evaluations/my-grades')} className="flex-1">
          Ver mi historial completo
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/student/evaluations')}
          className="flex-1"
        >
          <Home className="w-4 h-4 mr-2" />
          Volver a mis evaluaciones
        </Button>
      </div>
    </div>
  )
}

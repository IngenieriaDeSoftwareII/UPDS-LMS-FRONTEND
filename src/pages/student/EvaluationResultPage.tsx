import { useLocation, useNavigate } from 'react-router-dom'
import type { EvaluationSubmissionResult } from '@/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
      <Alert>
        <AlertTitle>Resultado no disponible</AlertTitle>
        <AlertDescription>Primero debes rendir una evaluación para ver este resumen.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resultado del intento #{result.numeroIntento}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p><strong>Evaluación:</strong> {result.evaluacionId}</p>
          <p><strong>Puntaje:</strong> {result.puntajeObtenido} / {result.puntajeMaximo}</p>
          <p><strong>Estado:</strong> {result.aprobado ? 'Aprobado' : 'Reprobado'}</p>
          <div className="flex gap-2 pt-2">
            <Button onClick={() => navigate('/student/evaluations/my-grades')}>Ver historial de notas</Button>
            <Button variant="outline" onClick={() => navigate('/student/evaluations')}>Volver</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

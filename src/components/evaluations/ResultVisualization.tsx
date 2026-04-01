import { Clock, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { EvaluationSubmissionResult } from '@/types'

interface ResultVisualizationProps {
  result: EvaluationSubmissionResult
}

export function ResultVisualization({ result }: ResultVisualizationProps) {
  const percentage = (result.puntajeObtenido / result.puntajeMaximo) * 100
  const isApproved = result.aprobado

  const getResultColor = () => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 70) return 'text-blue-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getResultEmoji = () => {
    if (percentage >= 90) return '🏆'
    if (percentage >= 70) return '⭐'
    if (percentage >= 50) return '👍'
    return '📚'
  }

  const getResultMessage = () => {
    if (percentage >= 90) return '¡Excelente desempeño!'
    if (percentage >= 70) return '¡Muy bien hecho!'
    if (percentage >= 50) return 'Aprobado con esfuerzo'
    return 'Necesitas mejorar'
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div>
              <span className="text-7xl block mb-4">{getResultEmoji()}</span>
              <h2 className={`text-3xl font-bold ${getResultColor()}`}>
                {isApproved ? '¡APROBADO!' : 'REPROBADO'}
              </h2>
              <p className="text-lg text-muted-foreground mt-2">
                {getResultMessage()}
              </p>
            </div>
            <div>
              <p className="text-5xl font-bold text-primary mb-2">
                {result.puntajeObtenido.toFixed(1)}
              </p>
              <p className="text-muted-foreground">
                de {result.puntajeMaximo.toFixed(1)} puntos
              </p>
            </div>
            <div className="flex justify-center">
              <Badge variant={isApproved ? 'default' : 'secondary'} className="px-4 py-2 text-base">
                {percentage.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Intento</p>
                <p className="text-lg font-semibold">#{result.numeroIntento}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="text-lg font-semibold">
                  {isApproved ? 'Aprobado' : 'Reprobado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium mb-3">Desglose de puntuación</p>
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isApproved ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Obtenido</p>
                <p className="text-lg font-bold text-primary">
                  {result.puntajeObtenido.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diferencia</p>
                <p className={`text-lg font-bold ${isApproved ? 'text-green-600' : 'text-red-600'}`}>
                  {isApproved
                    ? `+${(result.puntajeMaximo - result.puntajeObtenido).toFixed(1)}`
                    : `${(result.puntajeMaximo - result.puntajeObtenido).toFixed(1)}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Máximo</p>
                <p className="text-lg font-bold">
                  {result.puntajeMaximo.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { GraduationCap, TrendingUp, CheckCircle2, XCircle } from 'lucide-react'
import { getApiErrorMessages, useMyEvaluationGrades } from '@/hooks/useEvaluations'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Link } from 'react-router-dom'

export function MyEvaluationGradesPage() {
  const gradesQuery = useMyEvaluationGrades()
  const grades = gradesQuery.data ?? []

  const stats = grades.length > 0 ? {
    total: grades.length,
    aprobadas: grades.filter(g => g.aprobado).length,
    reprobadas: grades.filter(g => !g.aprobado).length,
    promedio: (grades.reduce((sum, g) => sum + g.puntajeObtenido, 0) / grades.length).toFixed(1),
    mejorNota: Math.max(...grades.map(g => g.puntajeObtenido)),
    peorNota: Math.min(...grades.map(g => g.puntajeObtenido)),
  } : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <GraduationCap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis evaluaciones</h1>
          <p className="text-sm text-muted-foreground">Historial completo de intentos y calificaciones.</p>
        </div>
      </div>

      {gradesQuery.isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo cargar el historial</AlertTitle>
          <AlertDescription>{getApiErrorMessages(gradesQuery.error).join(' ')}</AlertDescription>
        </Alert>
      )}

      {stats && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-muted-foreground">Aprobadas</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.aprobadas}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-muted-foreground">Reprobadas</p>
                </div>
                <p className="text-2xl font-bold text-red-600">{stats.reprobadas}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Promedio</p>
                <p className="text-2xl font-bold">{stats.promedio}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Mejor nota</p>
                <p className="text-2xl font-bold text-green-600">{stats.mejorNota.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Peor nota</p>
                <p className="text-2xl font-bold text-red-600">{stats.peorNota.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Historial de intentos
          </CardTitle>
          <CardDescription>
            {grades.length === 0
              ? 'Aún no has completado evaluaciones'
              : `${grades.length} evaluación(es) respondida(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gradesQuery.isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="mb-2">Cargando historial...</p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          ) : grades.length === 0 ? (
            <Alert>
              <AlertTitle>Sin evaluaciones completadas</AlertTitle>
              <AlertDescription>
                Cuando completes una evaluación, aparecerá aquí en tu historial.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evaluación</TableHead>
                    <TableHead>Intento</TableHead>
                    <TableHead>Puntaje</TableHead>
                    <TableHead>Máximo</TableHead>
                    <TableHead>Porcentaje</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map(grade => {
                    const percentage = ((grade.puntajeObtenido / grade.puntajeMaximo) * 100).toFixed(1)
                    return (
                      <TableRow key={grade.intentoId} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{grade.tituloEvaluacion}</TableCell>
                        <TableCell>#{grade.numeroIntento}</TableCell>
                        <TableCell className="font-semibold">{grade.puntajeObtenido.toFixed(1)}</TableCell>
                        <TableCell>{grade.puntajeMaximo.toFixed(1)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={grade.aprobado ? 'default' : 'secondary'}
                            className={grade.aprobado ? 'bg-green-600' : ''}
                          >
                            {percentage}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {grade.aprobado ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-green-600 font-medium">Aprobado</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="text-red-600 font-medium">Reprobado</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(grade.fechaEnvio).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link to="/student/evaluations">
            ← Volver a mis evaluaciones
          </Link>
        </Button>
      </div>
    </div>
  )
}

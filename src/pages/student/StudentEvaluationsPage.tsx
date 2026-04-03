import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { BookOpenCheck, ArrowRight, Clock } from 'lucide-react'
import { useMyEvaluationGrades } from '@/hooks/useEvaluations'
import { useAvailableEvaluations } from '@/hooks/useAvailableEvaluations'
import { studentProgressService } from '@/services/student-progress.service'
import type { StudentCourseLearning } from '@/types/student-progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

function labelInscripcionEstado(raw: string | undefined | null): string {
  const e = (raw ?? '').trim().toLowerCase()
  if (e === 'activo') return 'Inscripción activa'
  if (e === 'progreso') return 'En curso'
  if (e === 'terminado') return 'Completado'
  if (e === 'cancelado') return 'Cancelada'
  return raw?.trim() || '—'
}

function estadoCursoClass(raw: string | undefined | null): string {
  const e = (raw ?? '').toLowerCase()
  if (e === 'terminado') return 'text-green-600'
  if (e === 'cancelado') return 'text-destructive'
  return 'text-amber-700 dark:text-amber-500'
}

/** Alineado con el backend: curso terminado (inscripción completada). */
function puedeRendirEvaluacion(learning: StudentCourseLearning | undefined, queryLoading: boolean): boolean {
  if (queryLoading || !learning) return false
  if (!learning.inscrito) return false
  const e = (learning.estadoInscripcion ?? '').toLowerCase()
  return e === 'terminado' || learning.cursoCompletado === true
}

export function StudentEvaluationsPage() {
  const navigate = useNavigate()

  const availableEvaluationsQuery = useAvailableEvaluations()
  const myGradesQuery = useMyEvaluationGrades()

  const hasAvailableEvaluations = (availableEvaluationsQuery.data?.length ?? 0) > 0

  const courseIds = useMemo(
    () => [...new Set(availableEvaluationsQuery.data?.map(i => i.curso.id) ?? [])],
    [availableEvaluationsQuery.data],
  )

  const learningQueries = useQueries({
    queries: courseIds.map(cursoId => ({
      queryKey: ['student-learning', cursoId],
      queryFn: () => studentProgressService.getCourseLearning(cursoId),
      enabled: hasAvailableEvaluations && courseIds.length > 0,
      staleTime: 30_000,
    })),
  })

  const learningByCursoId = useMemo(() => {
    const map = new Map<number, StudentCourseLearning>()
    courseIds.forEach((id, idx) => {
      const row = learningQueries[idx]?.data
      if (row) map.set(id, row)
    })
    return map
  }, [courseIds, learningQueries])

  const queryIndexByCursoId = useMemo(() => {
    const m = new Map<number, number>()
    courseIds.forEach((id, idx) => m.set(id, idx))
    return m
  }, [courseIds])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BookOpenCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Evaluaciones</h1>
          <p className="text-sm text-muted-foreground">Rinde las evaluaciones de tus cursos completados.</p>
        </div>
      </div>

      {/* Cursos Completados */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Cursos disponibles para evaluación</h2>

        {availableEvaluationsQuery.isLoading ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Cargando tus cursos...
            </CardContent>
          </Card>
        ) : !hasAvailableEvaluations ? (
          <Alert>
            <BookOpenCheck className="w-4 h-4" />
            <AlertTitle>Sin evaluaciones disponibles</AlertTitle>
            <AlertDescription>
              No tienes evaluaciones disponibles en este momento. Completa cursos que tengan evaluaciones creadas.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {availableEvaluationsQuery.data?.map(inscription => {
              const idx = queryIndexByCursoId.get(inscription.curso.id) ?? -1
              const lq = idx >= 0 ? learningQueries[idx] : undefined
              const learning = learningByCursoId.get(inscription.curso.id)
              const learningPending = Boolean(lq?.isPending || lq?.isFetching)
              const learningError = Boolean(lq?.isError)
              const puedeRendir = puedeRendirEvaluacion(learning, learningPending)

              const estadoTexto = learningError
                ? 'No se pudo cargar'
                : learningPending
                  ? 'Cargando…'
                  : labelInscripcionEstado(learning?.estadoInscripcion)

              return (
                <Card
                  key={`${inscription.curso.id}-${inscription.id}`}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-base">
                      {inscription.curso.titulo}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {inscription.curso.descripcion || 'Sin descripción'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">Nivel</p>
                        <p className="font-medium">{inscription.curso.nivel}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">Estado del curso</p>
                        <p className={`font-medium ${learningError ? 'text-destructive' : estadoCursoClass(learning?.estadoInscripcion)}`}>
                          {estadoTexto}
                        </p>
                      </div>
                    </div>

                    {!learningPending && learning && !puedeRendir ? (
                      <p className="text-xs text-muted-foreground">
                        Completa el curso (todas las lecciones) para habilitar la evaluación final.
                      </p>
                    ) : null}

                    <Button
                      onClick={() => navigate(`/student/evaluations/${inscription.curso.id}`)}
                      className="w-full"
                      disabled={!puedeRendir || learningError}
                      title={
                        !puedeRendir && !learningError && !learningPending
                          ? 'Debes completar el curso antes de rendir la evaluación'
                          : undefined
                      }
                    >
                      Rendir evaluación
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Historial de Intentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Últimos intentos
          </CardTitle>
          <CardDescription>
            Tus evaluaciones respondidas recientemente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evaluación</TableHead>
                  <TableHead>Intento</TableHead>
                  <TableHead>Puntaje</TableHead>
                  <TableHead>Máximo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myGradesQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : myGradesQuery.data?.length ? (
                  myGradesQuery.data.slice(0, 5).map(item => (
                    <TableRow key={item.intentoId}>
                      <TableCell className="font-medium">{item.tituloEvaluacion}</TableCell>
                      <TableCell>#{item.numeroIntento}</TableCell>
                      <TableCell className="font-semibold">{item.puntajeObtenido.toFixed(1)}</TableCell>
                      <TableCell>{item.puntajeMaximo.toFixed(1)}</TableCell>
                      <TableCell>
                        {item.aprobado ? (
                          <span className="text-green-600 font-medium">Aprobado</span>
                        ) : (
                          <span className="text-red-600 font-medium">Reprobado</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.fechaEnvio).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link to="/student/evaluations/my-grades">Ver más</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Sin intentos registrados aún.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {(myGradesQuery.data?.length ?? 0) > 5 && (
            <div className="mt-4 flex justify-center">
              <Button variant="outline" asChild>
                <Link to="/student/evaluations/my-grades">Ver todas mis notas</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

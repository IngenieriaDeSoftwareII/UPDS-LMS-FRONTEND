import { useState } from 'react'
import { BarChart3, ArrowLeft } from 'lucide-react'
import { useEvaluationGradesForTeacher, getApiErrorMessages } from '@/hooks/useEvaluations'
import { useMyCourses } from '@/hooks/useMyCourses'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export function EvaluationGradesPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>()

  const myCoursesQuery = useMyCourses()
  const { data, isLoading, isError, error } = useEvaluationGradesForTeacher(selectedCourseId)

  const selectedCourseName = selectedCourseId
    ? myCoursesQuery.data?.find(c => c.curso.id === selectedCourseId)?.curso.titulo
    : undefined

  // Estadísticas
  const stats = data ? {
    totalEstudiantes: new Set(data.map(d => d.estudianteId)).size,
    aprobados: data.filter(d => d.aprobado).length,
    reprobados: data.filter(d => !d.aprobado).length,
    promedio: (data.reduce((sum, d) => sum + d.puntajeObtenido, 0) / (data.length || 1)).toFixed(1),
  } : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calificaciones de evaluaciones</h1>
          <p className="text-sm text-muted-foreground">Consulta el desempeño de tus estudiantes en las evaluaciones.</p>
        </div>
      </div>

      {/* Selec ción de Curso */}
      {!selectedCourseId ? (
        <Card>
          <CardHeader>
            <CardTitle>Selecciona un curso</CardTitle>
            <CardDescription>Elige un curso para ver las evaluaciones y calificaciones de tus estudiantes.</CardDescription>
          </CardHeader>
          <CardContent>
            {myCoursesQuery.isLoading ? (
              <p className="text-center text-muted-foreground py-8">Cargando tus cursos...</p>
            ) : myCoursesQuery.isError ? (
              <Alert variant="destructive">
                <AlertTitle>Error al cargar cursos</AlertTitle>
                <AlertDescription>No se pudieron cargar tus cursos. Intenta nuevamente.</AlertDescription>
              </Alert>
            ) : (myCoursesQuery.data?.length ?? 0) === 0 ? (
              <Alert>
                <AlertTitle>Sin cursos</AlertTitle>
                <AlertDescription>No tienes cursos con evaluaciones.</AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {myCoursesQuery.data?.map(inscription => (
                  <Card
                    key={inscription.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                    onClick={() => setSelectedCourseId(inscription.curso.id)}
                  >
                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-base">
                        {inscription.curso.titulo}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">
                        {inscription.curso.descripcion || 'Sin descripción'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">
                        Ver evaluaciones
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Botón para volver */}
          <Button
            variant="outline"
            onClick={() => setSelectedCourseId(undefined)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cambiar curso
          </Button>

          {/* Encabezado con nombre del curso */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{selectedCourseName}</h2>
            <p className="text-sm text-muted-foreground mt-1">Visualiza todas las evaluaciones y calificaciones</p>
          </div>

          {/* Estadísticas */}
          {stats && data && data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Estudiantes</p>
                      <p className="text-2xl font-bold">{stats.totalEstudiantes}</p>
                    </div>
                    <Badge variant="secondary">{stats.totalEstudiantes}</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Aprobados</p>
                      <p className="text-2xl font-bold text-green-600">{stats.aprobados}</p>
                    </div>
                    <Badge variant="default" className="bg-green-600">{Math.round((stats.aprobados / stats.totalEstudiantes) * 100)}%</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Reprobados</p>
                      <p className="text-2xl font-bold text-red-600">{stats.reprobados}</p>
                    </div>
                    <Badge variant="destructive">{Math.round((stats.reprobados / stats.totalEstudiantes) * 100)}%</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Promedio</p>
                      <p className="text-2xl font-bold">{stats.promedio}</p>
                    </div>
                    <Badge variant="outline">/20</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Errores */}
          {isError && (
            <Alert variant="destructive">
              <AlertTitle>No se pudieron cargar las evaluaciones</AlertTitle>
              <AlertDescription>{getApiErrorMessages(error).join(' ')}</AlertDescription>
            </Alert>
          )}

          {/* Tabla de resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Evaluaciones y calificaciones</CardTitle>
              <CardDescription>Historial completo de evaluaciones respondidas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Evaluación</TableHead>
                      <TableHead>Intento</TableHead>
                      <TableHead>Puntaje</TableHead>
                      <TableHead>Máximo</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          Cargando evaluaciones...
                        </TableCell>
                      </TableRow>
                    ) : data?.length ? (
                      data.map(row => {
                        const percentage = ((row.puntajeObtenido / row.puntajeMaximo) * 100).toFixed(1)
                        return (
                          <TableRow key={row.intentoId}>
                            <TableCell className="font-medium">{row.estudianteNombreCompleto}</TableCell>
                            <TableCell>{row.tituloEvaluacion}</TableCell>
                            <TableCell>#{row.numeroIntento}</TableCell>
                            <TableCell className="font-semibold">{row.puntajeObtenido.toFixed(1)}</TableCell>
                            <TableCell>{row.puntajeMaximo.toFixed(1)}</TableCell>
                            <TableCell>
                              <Badge variant={row.aprobado ? 'default' : 'secondary'}>
                                {percentage}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {row.aprobado ? (
                                <span className="text-green-600 font-medium">Aprobado</span>
                              ) : (
                                <span className="text-red-600 font-medium">Reprobado</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(row.fechaEnvio).toLocaleDateString('es-ES')}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No hay evaluaciones respondidas aún en este curso.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

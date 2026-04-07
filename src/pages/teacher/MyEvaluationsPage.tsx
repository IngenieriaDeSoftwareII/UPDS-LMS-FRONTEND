import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, Eye, FileText } from 'lucide-react'
import { useMyCourses } from '@/hooks/useMyCourses'
import { useCoursesWithoutEvaluation } from '@/hooks/useCoursesWithoutEvaluation'
import { useEvaluationByCourseId } from '@/hooks/useEvaluations'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function MyEvaluationsPage() {
  const navigate = useNavigate()
  const myCoursesQuery = useMyCourses()
  const coursesWithoutEvaluationQuery = useCoursesWithoutEvaluation()

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)

  const evaluationQuery = useEvaluationByCourseId(selectedCourseId || undefined)

  const coursesWithEvaluation = myCoursesQuery.data?.filter(course =>
    !coursesWithoutEvaluationQuery.data?.some(c => c.id === course.curso.id)
  )

  const handleViewEvaluation = (courseId: number) => {
    setSelectedCourseId(courseId)
  }

  const handleEditEvaluation = (courseId: number) => {
    // Navigate to edit page, perhaps reuse the management page with edit mode
    navigate(`/teacher/evaluations/edit/${courseId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Evaluaciones</h1>
          <p className="text-sm text-muted-foreground">Gestiona todas las evaluaciones que has creado para tus cursos.</p>
        </div>
      </div>

      {myCoursesQuery.isLoading || coursesWithoutEvaluationQuery.isLoading ? (
        <p className="text-center text-muted-foreground py-8">Cargando tus evaluaciones...</p>
      ) : myCoursesQuery.isError || coursesWithoutEvaluationQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Error al cargar evaluaciones</AlertTitle>
          <AlertDescription>No se pudieron cargar tus evaluaciones. Intenta nuevamente.</AlertDescription>
        </Alert>
      ) : (coursesWithEvaluation?.length ?? 0) === 0 ? (
        <Alert>
          <AlertTitle>Sin evaluaciones</AlertTitle>
          <AlertDescription>No has creado ninguna evaluación para ningún curso aún.</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {coursesWithEvaluation?.map(inscription => (
            <Card key={`course-${inscription.curso.id}`} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-2 text-base">{inscription.curso.titulo}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs">{inscription.curso.descripcion || 'Sin descripción'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewEvaluation(inscription.curso.id)}>
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditEvaluation(inscription.curso.id)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedCourseId && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Curso: {evaluationQuery.data?.nombreCurso || `Curso ${selectedCourseId}`}</CardTitle>
            <CardDescription>{evaluationQuery.data?.titulo}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {evaluationQuery.isLoading ? (
              <p className="text-center py-8">Cargando evaluación...</p>
            ) : evaluationQuery.isError ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>No tienes permisos para ver esta evaluación o no existe.</AlertDescription>
              </Alert>
            ) : evaluationQuery.data ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold"><strong>Descripción:</strong></h3>
                  <p className="text-sm text-muted-foreground">{evaluationQuery.data.descripcion || 'Sin descripción'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Puntaje máximo:</p>
                    <p className="font-semibold">{evaluationQuery.data.puntajeMaximo ?? 'No definido'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Puntaje mínimo aprobación:</p>
                    <p className="font-semibold">{evaluationQuery.data.puntajeMinimoAprobacion ?? 'No definido'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Intentos permitidos:</p>
                    <p className="font-semibold">{evaluationQuery.data.intentosPermitidos}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tiempo límite (minutos):</p>
                    <p className="font-semibold">{evaluationQuery.data.tiempoLimiteMax ?? 'Sin límite'}</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Preguntas ({evaluationQuery.data.preguntas?.length || 0})</h3>
                  
                  <div className="space-y-6">
                    {evaluationQuery.data.preguntas && evaluationQuery.data.preguntas.length > 0 ? (
                      evaluationQuery.data.preguntas.map((pregunta, idx) => (
                        <Card key={`pregunta-${idx}`} className="bg-slate-50 dark:bg-slate-950">
                          <CardHeader>
                            <CardTitle className="text-base">
                              Pregunta {idx + 1} - {pregunta.puntos} pts
                            </CardTitle>
                            <CardDescription>{pregunta.enunciado}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {pregunta.opciones && pregunta.opciones.length > 0 ? (
                                pregunta.opciones.map((opcion, optIdx) => (
                                  <div key={`opcion-${idx}-${optIdx}`} className="flex items-start gap-3 p-3 border border-border rounded-md bg-background dark:bg-slate-900 dark:border-slate-700">
                                    <div className="flex-1">
                                      <p className="text-sm">{opcion.texto}</p>
                                    </div>
                                    {opcion.esCorrecta && (
                                      <Badge className="bg-green-600 flex-shrink-0">✓ Correcta</Badge>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">Sin opciones</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No hay preguntas en esta evaluación.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No hay evaluación para este curso.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
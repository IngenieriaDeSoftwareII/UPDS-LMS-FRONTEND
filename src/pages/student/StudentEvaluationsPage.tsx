import { Link, useNavigate } from 'react-router-dom'
import { BookOpenCheck, ArrowRight, Clock } from 'lucide-react'
import { useMyEvaluationGrades } from '@/hooks/useEvaluations'
import { useAvailableEvaluations } from '@/hooks/useAvailableEvaluations'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function StudentEvaluationsPage() {
  const navigate = useNavigate()

  const availableEvaluationsQuery = useAvailableEvaluations()
  const myGradesQuery = useMyEvaluationGrades()

  const hasAvailableEvaluations = (availableEvaluationsQuery.data?.length ?? 0) > 0

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
            {availableEvaluationsQuery.data?.map(inscription => (
              <Card key={inscription.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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
                      <p className="text-muted-foreground text-xs">Estado</p>
                      <p className="font-medium text-green-600">Completado</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate(`/student/evaluations/${inscription.curso.id}`)}
                    className="w-full"
                  >
                    Rendir evaluación
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
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

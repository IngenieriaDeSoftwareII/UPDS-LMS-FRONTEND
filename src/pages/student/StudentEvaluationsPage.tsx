import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpenCheck } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useMyEvaluationGrades } from '@/hooks/useEvaluations'
import { inscriptionService } from '@/services/inscriptionService'
import { useQuery } from '@tanstack/react-query'
import http from '@/lib/http'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function StudentEvaluationsPage() {
  const [courseId, setCourseId] = useState('')
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => http.get<{ personId: number }>('/Profile/me').then(res => res.data),
    enabled: isAuthenticated,
  })

  const myCoursesQuery = useQuery({
    queryKey: ['student-my-courses', profileQuery.data?.personId],
    queryFn: () => inscriptionService.getMyCourses(profileQuery.data?.personId ?? 0),
    enabled: Boolean(profileQuery.data?.personId),
  })

  const myGradesQuery = useMyEvaluationGrades()

  const isCourseCompleted = useMemo(
    () =>
      (myCoursesQuery.data ?? []).some(
        course => {
          const estado = (course.estado ?? '').trim().toLowerCase()
          return (
            estado === 'terminado' ||
            estado === 'completado' ||
            estado === 'finalizado' ||
            Boolean(course.fechaCompletado)
          )
        }
      ),
    [myCoursesQuery.data]
  )

  const verificationFailed = myCoursesQuery.isError
  const canTakeExam = Boolean(courseId) && (isCourseCompleted || verificationFailed)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BookOpenCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Evaluaciones</h1>
          <p className="text-sm text-muted-foreground">Rinde tu evaluación final y revisa tu historial.</p>
        </div>
      </div>

      {!isCourseCompleted && !verificationFailed && (
        <Alert>
          <AlertTitle>Aún no puedes rendir</AlertTitle>
          <AlertDescription>Debes completar al menos un curso para habilitar el examen final.</AlertDescription>
        </Alert>
      )}

      {verificationFailed && (
        <Alert>
          <AlertTitle>No se pudo verificar tu estado de curso</AlertTitle>
          <AlertDescription>
            El servicio de inscripciones devolvió error. Puedes intentar rendir, y el backend validará si realmente cumples el requisito.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Rendir evaluación</CardTitle>
          <CardDescription>Ingresa el ID del curso para cargar la evaluación final.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Input
            type="number"
            min={1}
            value={courseId}
            onChange={event => setCourseId(event.target.value)}
            placeholder="ID del curso"
          />
          <Button
            disabled={!canTakeExam}
            onClick={() => navigate(`/student/evaluations/${courseId}`)}
          >
            Rendir examen
          </Button>
          <Button asChild variant="outline">
            <Link to="/student/evaluations/my-grades">Ver mis notas</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimos intentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evaluación</TableHead>
                <TableHead>Intento</TableHead>
                <TableHead>Puntaje</TableHead>
                <TableHead>Máximo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myGradesQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">Cargando...</TableCell>
                </TableRow>
              ) : myGradesQuery.data?.length ? (
                myGradesQuery.data.slice(0, 5).map(item => (
                  <TableRow key={item.intentoId}>
                    <TableCell>{item.tituloEvaluacion}</TableCell>
                    <TableCell>{item.numeroIntento}</TableCell>
                    <TableCell>{item.puntajeObtenido}</TableCell>
                    <TableCell>{item.puntajeMaximo}</TableCell>
                    <TableCell>{item.aprobado ? 'Aprobado' : 'Reprobado'}</TableCell>
                    <TableCell>{new Date(item.fechaEnvio).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">Sin intentos registrados.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

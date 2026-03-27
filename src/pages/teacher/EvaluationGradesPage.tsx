import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { useEvaluationGradesForTeacher, getApiErrorMessages } from '@/hooks/useEvaluations'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function EvaluationGradesPage() {
  const [courseIdInput, setCourseIdInput] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>()

  const { data, isLoading, isError, error } = useEvaluationGradesForTeacher(selectedCourseId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notas por curso</h1>
          <p className="text-sm text-muted-foreground">Consulta intentos y resultados del examen final por curso.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar por curso</CardTitle>
          <CardDescription>Ingresa el ID del curso para cargar calificaciones.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Input
            type="number"
            min={1}
            placeholder="ID de curso"
            value={courseIdInput}
            onChange={event => setCourseIdInput(event.target.value)}
          />
          <Button onClick={() => setSelectedCourseId(Number(courseIdInput))} disabled={!courseIdInput}>
            Buscar
          </Button>
        </CardContent>
      </Card>

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudieron cargar las notas</AlertTitle>
          <AlertDescription>{getApiErrorMessages(error).join(' ')}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Intento</TableHead>
                <TableHead>Puntaje</TableHead>
                <TableHead>Máximo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!selectedCourseId ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Ingresa un ID para comenzar.
                  </TableCell>
                </TableRow>
              ) : isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">Cargando...</TableCell>
                </TableRow>
              ) : data?.length ? (
                data.map(row => (
                  <TableRow key={row.intentoId}>
                    <TableCell>{row.estudianteNombreCompleto}</TableCell>
                    <TableCell>{row.numeroIntento}</TableCell>
                    <TableCell>{row.puntajeObtenido}</TableCell>
                    <TableCell>{row.puntajeMaximo}</TableCell>
                    <TableCell>{row.aprobado ? 'Aprobado' : 'Reprobado'}</TableCell>
                    <TableCell>{new Date(row.fechaEnvio).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No existen registros para este curso.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

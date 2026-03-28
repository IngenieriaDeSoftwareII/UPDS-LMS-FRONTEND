import { GraduationCap } from 'lucide-react'
import { getApiErrorMessages, useMyEvaluationGrades } from '@/hooks/useEvaluations'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function MyEvaluationGradesPage() {
  const gradesQuery = useMyEvaluationGrades()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <GraduationCap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis calificaciones</h1>
          <p className="text-sm text-muted-foreground">Historial de intentos en evaluaciones finales.</p>
        </div>
      </div>

      {gradesQuery.isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo cargar el historial</AlertTitle>
          <AlertDescription>{getApiErrorMessages(gradesQuery.error).join(' ')}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evaluación</TableHead>
                <TableHead>Intento</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Máxima</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gradesQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">Cargando...</TableCell>
                </TableRow>
              ) : gradesQuery.data?.length ? (
                gradesQuery.data.map(grade => (
                  <TableRow key={grade.intentoId}>
                    <TableCell>{grade.tituloEvaluacion}</TableCell>
                    <TableCell>{grade.numeroIntento}</TableCell>
                    <TableCell>{grade.puntajeObtenido}</TableCell>
                    <TableCell>{grade.puntajeMaximo}</TableCell>
                    <TableCell>{grade.aprobado ? 'Aprobado' : 'Reprobado'}</TableCell>
                    <TableCell>{new Date(grade.fechaEnvio).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Aún no tienes intentos registrados.
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

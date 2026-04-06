import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ClipboardList,
  Users,
  CheckCircle2,
  Clock,
  FileDown,
  MessageSquare,
  Loader2,
  ServerCrash,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'

import { useHomeWork } from '@/hooks/useHomeWork'
import { useHomeworkSubmission } from '@/hooks/useHomeworkSubmiss'
import { getApiErrorMessage } from '@/lib/api.error'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { homeWorkSubmissionDto } from '@/types/homeworkSubmission'

//  Helpers

function formatDate(date: Date | string | undefined) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getEstadoBadge(estado: string, revisado: boolean) {
  if (revisado) {
    return <Badge className="bg-green-600 hover:bg-green-700">Revisado</Badge>
  }
  switch (estado?.toLowerCase()) {
    case 'entregado':
      return <Badge variant="default">Entregado</Badge>
    case 'tarde':
      return <Badge className="bg-amber-500 hover:bg-amber-600">Tarde</Badge>
    case 'pendiente':
      return <Badge variant="secondary">Pendiente</Badge>
    default:
      return <Badge variant="outline">{estado || 'Sin estado'}</Badge>
  }
}

//  Main Page Component

export function TeacherSubmissionsPage() {
  const { homeworkId } = useParams()
  const navigate = useNavigate()
  const hwId = Number(homeworkId)

  // Data hooks
  const { getSubmissions } = useHomeWork()
  const { grade, getUrl } = useHomeworkSubmission()

  // Local state for the fetched data
  const [submissions, setSubmissions] = useState<homeWorkSubmissionDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [errorMsg, setErrorMsg] = useState<unknown>(null)

  // Fetch submissions on mount
  const fetchSubmissions = () => {
    if (!hwId || isNaN(hwId)) return
    setIsLoading(true)
    setIsError(false)
    getSubmissions.mutate(hwId, {
      onSuccess: (data) => {
        console.log('✅ API response:', data)
        setSubmissions(data)
        setIsLoading(false)
      },
      onError: (err) => {
        console.error('❌ API error:', err)
        setIsError(true)
        setErrorMsg(err)
        setIsLoading(false)
      },
    })
  }

  useEffect(() => {
    fetchSubmissions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hwId])

  // Dialog state
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<homeWorkSubmissionDto | null>(null)
  const [feedback, setFeedback] = useState('')
  const [revisado, setRevisado] = useState(false)

  //  Handlers

  const handleOpenGradeDialog = (submission: homeWorkSubmissionDto) => {
    setSelectedSubmission(submission)
    setFeedback(submission.feedback ?? '')
    setRevisado(submission.revisado)
    setGradeDialogOpen(true)
  }

  const handleGrade = () => {
    if (!selectedSubmission) return

    grade.mutate(
      {
        SubmissionId: selectedSubmission.id,
        Revisado: revisado,
        Feedback: feedback,
      },
      {
        onSuccess: () => {
          toast.success('Entrega actualizada correctamente')
          setGradeDialogOpen(false)
          fetchSubmissions()
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err, 'Error al calificar la entrega'))
        },
      }
    )
  }

  const handleDownloadFile = (submissionId: number) => {
    getUrl.mutate(submissionId, {
      onSuccess: (data) => {
        if (data?.url) {
          window.open(data.url, '_blank')
        } else {
          toast.error('No se pudo obtener la URL del archivo')
        }
      },
      onError: () => {
        toast.error('Error al obtener el archivo')
      },
    })
  }

  //  Stats

  const homeworkTitulo = submissions.length > 0 ? submissions[0].homeworkTitulo : 'Tarea'

  const stats = {
    total: submissions.length,
    revisados: submissions.filter((s) => s.revisado).length,
    pendientes: submissions.filter((s) => !s.revisado).length,
  }

  //  Render

  if (!hwId || isNaN(hwId)) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>ID de tarea inválido</AlertTitle>
          <AlertDescription>
            No se pudo determinar la tarea a consultar.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/*  HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClipboardList className="h-4 w-4" />
            <span>Entregas de Tarea</span>
          </div>
        </div>
      </div>

      {/*LOADING STATE*/}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Error al cargar las entregas</AlertTitle>
          <AlertDescription className="flex items-center gap-2 flex-wrap">
            {getApiErrorMessage(errorMsg, 'Ocurrió un error al cargar la información')}
            <Button variant="link" onClick={() => fetchSubmissions()} className="px-2">
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/*  HOMEWORK INFO CARD*/}
          <Card className="overflow-hidden border border-border shadow-sm">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {homeworkTitulo}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {submissions.length} entrega(s) recibida(s)
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/*  STATS  */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Entregas</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revisados</p>
                    <p className="text-2xl font-bold text-green-600">{stats.revisados}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/30">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pendientes</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pendientes}</p>
                  </div>
                  <div className="p-2 bg-amber-100 rounded-lg dark:bg-amber-900/30">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/*  SUBMISSIONS TABLE  */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Entregas de Estudiantes</CardTitle>
              <CardDescription>
                Listado de todas las entregas recibidas para esta tarea.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Fecha de Entrega</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Comentario</TableHead>
                      <TableHead>Archivo</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No se han recibido entregas para esta tarea.
                        </TableCell>
                      </TableRow>
                    ) : (
                      submissions.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">
                            {sub.estudianteNombre}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(sub.fechaEntrega)}
                          </TableCell>
                          <TableCell>
                            {getEstadoBadge(sub.estado, sub.revisado)}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {sub.comentario || '—'}
                          </TableCell>
                          <TableCell>
                            {sub.urlArchivo ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadFile(sub.id)}
                                disabled={getUrl.isPending}
                              >
                                <FileDown className="w-4 h-4 mr-1" />
                                {sub.formato ? String(sub.formato) : 'Archivo'}
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Sin archivo
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenGradeDialog(sub)}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Revisar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/*  GRADE DIALOG  */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Revisar Entrega</DialogTitle>
            <DialogDescription>
              Entrega de{' '}
              <span className="font-semibold text-foreground">
                {selectedSubmission?.estudianteNombre}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Submission info */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">
                Detalles de la Entrega
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">
                    Fecha:
                  </span>
                  <p className="mt-1">
                    {formatDate(selectedSubmission?.fechaEntrega)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Estado:
                  </span>
                  <p className="mt-1">{selectedSubmission?.estado}</p>
                </div>
                {selectedSubmission?.comentario && (
                  <div className="col-span-2">
                    <span className="font-medium text-muted-foreground">
                      Comentario del estudiante:
                    </span>
                    <p className="mt-1 text-sm">{selectedSubmission.comentario}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Grade form */}
            <div>
              <label className="text-sm font-medium">Feedback</label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Escribe un comentario de retroalimentación para el estudiante..."
                className="mt-1"
              />
            </div>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={revisado}
                onChange={(e) => setRevisado(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm">
                Marcar como revisado
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setGradeDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleGrade} disabled={grade.isPending}>
                {grade.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Revisión'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import http from '@/lib/http'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  ImageOff,
  Loader2,
  ServerCrash,
  FileText,
  ClipboardList,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import { useCourseById } from '@/hooks/useCourses'
import { useHomeWork } from '@/hooks/useHomeWork'
import { useHomeworkSubmission } from '@/hooks/useHomeworkSubmiss'
import type { getHomeWorkDto } from '@/types/homeWork'
import { useAuthStore } from '@/store/auth.store'
import { inscriptionService } from '@/services/inscription.service'
import { studentProgressService } from '@/services/student-progress.service'
import { getApiErrorMessage } from '@/lib/api.error'
import { getErrorMessage } from '@/lib/api.error'
import type { Course } from '@/types/course'
import { useVideoContents } from '@/hooks/useVideoContents'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
//mio
import { useDocumentContents } from '@/hooks/useDocumentContents'
import { useImageContents } from '@/hooks/useImageContents'
import { toast } from 'sonner'

const DEFAULT_COURSE_IMAGE_URL = 'https://www.ucentral.edu.co/sites/default/files/imagenes-ucentral/Noticentral/2021-04/04-19-21-tecnicas-de-estudio-03.webp'

const resolveImageUrl = () => DEFAULT_COURSE_IMAGE_URL


function labelInscripcionEstado(raw: string | undefined | null): string {
  const e = (raw ?? '').trim().toLowerCase()
  if (e === 'activo') return 'Inscripción activa'
  if (e === 'progreso') return 'En curso'
  if (e === 'terminado') return 'Completado'
  if (e === 'cancelado') return 'Cancelada'
  return raw?.trim() || '—'
}

export function CourseDetail() {
  const { useDocumentsList } = useDocumentContents()
  const { data: documents } = useDocumentsList()
  const { useImagesList } = useImageContents()
  const { data: images } = useImagesList()
  const { getAll: getHomeworks } = useHomeWork()
  const { data: homeworks = [] } = getHomeworks
  const { getAll: getSubmissions, submit: submitHomework } = useHomeworkSubmission()
  const { data: submissions = [] } = getSubmissions
  const { useVideosList } = useVideoContents()
  const { data: videos = [] } = useVideosList()

  const [submissionHomework, setSubmissionHomework] = useState<getHomeWorkDto | null>(null)
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)
  const [submissionComment, setSubmissionComment] = useState('')

  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s: any) => s.isAuthenticated)
  const role = useAuthStore((s: any) => s.role)

  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => http.get<{ personId: number }>('/Profile/me').then(res => res.data),
    enabled: isAuthenticated,
  })

  const cursoId = Number(id)
  const courseQuery = useCourseById(Number.isFinite(cursoId) && cursoId > 0 ? cursoId : 0)

  const learningQuery = useQuery({
    queryKey: ['student-learning', cursoId],
    queryFn: () => studentProgressService.getCourseLearning(cursoId),
    enabled: Boolean(isAuthenticated && role === 'Estudiante' && profileQuery.data?.personId && cursoId > 0),
    retry: 1,
  })

  const moduleGradesQuery = useQuery({
    queryKey: ['student-module-grades', cursoId],
    queryFn: () => studentProgressService.getModuleGrades(cursoId),
    enabled: Boolean(learningQuery.data?.inscrito),
  })

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [brokenHero, setBrokenHero] = useState(false)
  const [completingLessonId, setCompletingLessonId] = useState<number | null>(null)

  const course = courseQuery.data
  const learning = learningQuery.data

  //mio
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)
  useEffect(() => {
    if (learning?.modulos?.length && selectedModuleId === null) {
      setSelectedModuleId(learning.modulos[0].id)
    }
  }, [learning, selectedModuleId])
  const selectedModule = learning?.modulos?.find(
    m => m.id === selectedModuleId
  )

  const inscriptionMutation = useMutation({
    mutationFn: () =>
      inscriptionService.create({
        usuarioId: profileQuery.data!.personId,
        cursoId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-learning', cursoId] })
      queryClient.invalidateQueries({ queryKey: ['student-my-courses'] })
      queryClient.invalidateQueries({ queryKey: ['student-my-courses', profileQuery.data?.personId] })
      queryClient.invalidateQueries({ queryKey: ['student-module-grades', cursoId] })
      setConfirmOpen(false)
    },
  })

  const completeMutation = useMutation({
    mutationFn: (leccionId: number) => studentProgressService.completeLesson(leccionId),
    onMutate: (leccionId: number) => {
      setCompletingLessonId(leccionId)
    },
    onSettled: () => {
      setCompletingLessonId(null)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-learning', cursoId] })
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['student-my-courses'] })
      queryClient.invalidateQueries({ queryKey: ['student-module-grades', cursoId] })
    },
  })

  const certMutation = useMutation({
    mutationFn: () => studentProgressService.downloadCertificate(cursoId),
  })

  const handleHomeworkSubmit = () => {
    if (!submissionHomework || !submissionFile || !profileQuery.data?.personId) return

    const formData = new FormData()
    // Configuración exacta pedida:
    formData.append('homeworkId', submissionHomework.id.toString())
    formData.append('File', submissionFile)

    if (submissionComment) {
      formData.append('Comentario', submissionComment)
    }

    const fileName = submissionFile.name
    const ext = fileName.split('.').pop()?.toLowerCase() || 'otro'
    formData.append('Formato', ext)
    formData.append('TamanoKb', Math.round(submissionFile.size / 1024).toString())

    submitHomework.mutate(formData, {
      onSuccess: () => {
        toast.success('Tarea entregada correctamente')
        setSubmissionHomework(null)
        setSubmissionFile(null)
        setSubmissionComment('')
      },
      onError: (err: any) => {
        const msg = getErrorMessage(err, 'Error al entregar tarea')
        toast.error(msg)
      }
    })
  }



  const heroImage = useMemo(() => resolveImageUrl(), [])

  const estadoInscripcion = (learning?.estadoInscripcion ?? '').toLowerCase()
  const yaInscrito = Boolean(learning?.inscrito)
  const terminado = estadoInscripcion === 'terminado'
  const puedeCertificado =
    learning?.puedeDescargarCertificado !== undefined
      ? Boolean(learning.puedeDescargarCertificado)
      : terminado
  const tieneEval = Boolean(learning?.tieneEvaluacionFinal)
  const notaExam = learning?.notaEvaluacionSobre100

  if (!id || !Number.isFinite(cursoId) || cursoId <= 0) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>ID inválido</AlertTitle>
          <AlertDescription>La URL del curso no es válida.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (courseQuery.isError) {
    return (
      <div className="p-6 space-y-4">
        <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>No se pudo cargar el curso</AlertTitle>
          <AlertDescription>{getErrorMessage(courseQuery.error, 'Error desconocido')}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate('/student/courses')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al catálogo
        </Button>
      </div>
    )
  }

  if (courseQuery.isLoading || !course) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  const titulo = course.titulo
  const descripcion = course.descripcion
  const nivel = course.nivel
  const duracionMin = course.duracion_total_min


  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/student/courses')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Catálogo
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>Detalle del curso</span>
        </div>
      </div>

      <Card className="overflow-hidden border border-border shadow-sm">
        <div className="relative h-52 w-full bg-muted/60 md:h-64">
          {heroImage && !brokenHero ? (
            <img
              src={heroImage}
              alt={titulo}
              className="h-full w-full object-cover"
              onError={() => setBrokenHero(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="h-8 w-8" /> Sin imagen
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="mb-4 inline-block rounded-full bg-primary/25 px-3 py-1 text-xs font-medium text-white">
                {nivel ?? '—'}
              </span>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{titulo}</h1>
              {learning?.docenteNombre ? (
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  Docente: {learning.docenteNombre}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <CardHeader className="border-b border-border bg-muted/30">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">Resumen</CardTitle>
                {learning && yaInscrito && learning.estadoInscripcion ? (
                  <Badge variant={terminado ? 'default' : 'secondary'}>
                    {labelInscripcionEstado(learning.estadoInscripcion)}
                  </Badge>
                ) : null}
              </div>
              <CardDescription>
                {descripcion ?? 'Sin descripción disponible.'}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {isAuthenticated && role === 'Estudiante' && profileQuery.data?.personId ? (
                learningQuery.isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Comprobando inscripción…
                  </div>
                ) : yaInscrito ? (
                  <Button variant="secondary" disabled className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {terminado ? 'Curso completado' : 'Ya estás inscrito'}
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => setConfirmOpen(true)} className="gap-2">
                      <BookOpen className="h-4 w-4" /> Inscribirme
                    </Button>
                    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirmar inscripción</DialogTitle>
                          <DialogDescription>
                            ¿Deseas inscribirte en «{titulo}»? Podrás acceder al contenido y registrar tu
                            progreso.
                          </DialogDescription>
                        </DialogHeader>
                        {inscriptionMutation.isError ? (
                          <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                              {getErrorMessage(inscriptionMutation.error, 'No se pudo inscribir')}
                            </AlertDescription>
                          </Alert>
                        ) : null}
                        <DialogFooter className="gap-2 sm:gap-0">
                          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                            Cancelar
                          </Button>
                          <Button
                            disabled={inscriptionMutation.isPending}
                            onClick={() => inscriptionMutation.mutate()}
                          >
                            {inscriptionMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando…
                              </>
                            ) : (
                              'Confirmar'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )
              ) : (
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Inicia sesión para inscribirte
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {descripcion ?? 'Sin descripción disponible.'}
          </p>

          {learningQuery.isError && isAuthenticated && role === 'Estudiante' ? (
            <Alert variant="destructive">
              <AlertTitle>No se pudo cargar el progreso</AlertTitle>
              <AlertDescription>
                {getErrorMessage(learningQuery.error, 'Intenta de nuevo más tarde.')}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Duración estimada</p>
              <p className="text-lg font-semibold">{Math.max(1, Math.floor(duracionMin / 60))} h</p>
            </div>
            <div className="rounded-xl border border-border bg-card/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Progreso en lecciones</p>
              {!isAuthenticated || role !== 'Estudiante' ? (
                <p className="text-sm text-muted-foreground">Inicia sesión como estudiante para ver tu avance.</p>
              ) : learningQuery.isLoading ? (
                <Skeleton className="mt-2 h-10 w-full" />
              ) : learning ? (
                <>
                  <p className="text-lg font-semibold tabular-nums">{learning.progresoPorcentaje}%</p>
                  <Progress value={learning.progresoPorcentaje} className="mt-2 h-2" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {learning.leccionesCompletadas} / {learning.leccionesTotales} lecciones completadas
                    {!yaInscrito
                      ? ' · Inscríbete para poder marcar lecciones y guardar el avance (ahora 0%).'
                      : null}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No se pudo cargar el progreso.</p>
              )}
            </div>
          </div>

          {learning && yaInscrito && terminado && puedeCertificado ? (
            <div className="flex flex-wrap gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <Award className="h-6 w-6 shrink-0 text-primary" />
              <div className="flex-1 space-y-2">
                <p className="font-semibold">Certificado disponible</p>
                <p className="text-sm text-muted-foreground">
                  Evaluación final aprobada
                  {notaExam != null ? ` (${notaExam.toFixed(0)}/100)` : ''}. Descarga tu constancia en PDF con nombre,
                  curso y fecha de finalización.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={certMutation.isPending}
                  onClick={() => certMutation.mutate()}
                >
                  {certMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Descargar PDF
                </Button>
                {certMutation.isError ? (
                  <p className="text-sm text-destructive">
                    {getErrorMessage(certMutation.error, 'No se pudo generar el certificado')}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {learning && yaInscrito && terminado && !puedeCertificado && learning.mensajeCertificado ? (
            <Alert>
              <AlertTitle>Certificado no disponible</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>{learning.mensajeCertificado}</p>
                {tieneEval ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/student/evaluations/${cursoId}`)}
                  >
                    Ir a la evaluación final
                  </Button>
                ) : null}
              </AlertDescription>
            </Alert>
          ) : null}

          {learning && yaInscrito && moduleGradesQuery.data && moduleGradesQuery.data.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Nota ponderada por módulo</h2>
              <div className="rounded-xl border border-border divide-y">
                {moduleGradesQuery.data.map(m => (
                  <div key={m.moduloId} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                    <span className="font-medium">{m.tituloModulo}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {m.notaPonderada != null ? `${m.notaPonderada.toFixed(2)} / 100` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {learning && learning.modulos.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Contenido del curso</h2>

              {/* SELECT DE MÓDULOS */}
              <label className="text-sm font-medium">Módulos:</label>
              <select
                className="w-full border rounded-lg p-2"
                value={selectedModuleId?.toString() ?? ''}
                onChange={(e) => setSelectedModuleId(Number(e.target.value))}
              >
                {learning.modulos.map(mod => (
                  <option key={mod.id} value={mod.id}>
                    {mod.titulo}
                  </option>
                ))}
              </select>

              {/* 🔥 LECCIONES DEL MÓDULO SELECCIONADO */}
              {!selectedModule ? (
                <p className="text-sm text-muted-foreground">
                  Selecciona un módulo
                </p>
              ) : selectedModule?.lecciones?.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Este módulo no tiene lecciones
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedModule?.lecciones?.map(leccion => {
                    const busy = completingLessonId === leccion.id

                    const fixUrl = (url?: string) => {
                      if (!url) return ''
                      if (url.startsWith('http')) return url
                      return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`
                    }

                    // 📄 DOCUMENTOS
                    const lessonDocs = (documents ?? []).filter((d: any) => {
                      const lessonId =
                        d.content?.lessonId ??
                        d.content?.leccion_id ??
                        d.lessonId ??
                        d.leccion_id

                      return Number(lessonId) === Number(leccion.id)
                    })

                    // 🖼️ IMÁGENES
                    const lessonImages = (images ?? []).filter((img: any) => {
                      const lessonId =
                        img.content?.lessonId ??
                        img.content?.leccion_id ??
                        img.lessonId ??
                        img.leccion_id

                      return Number(lessonId) === Number(leccion.id)
                    })
                    // VIDEOS
                    const lessonVideos = (videos ?? []).filter((v: any) => {
                      const lessonId =
                        v.content?.lessonId ??
                        v.lessonId

                      return Number(lessonId) === Number(leccion.id)
                    })

                    //  TAREAS (HOMEWORKS)
                    const lessonHWs = homeworks.filter((hw: getHomeWorkDto) =>
                      Number(hw.lessonId) === Number(leccion.id)
                    )

                    //  COMBINAR
                    const contenidos = [
                      ...lessonDocs.map((doc: any) => ({
                        type: 'document' as const,
                        id: doc.contentId ?? doc.id,
                        title:
                          doc.content?.title ??
                          doc.content?.titulo ??
                          doc.title ??
                          'Documento',
                        order: Number(
                          doc.content?.order ??
                          doc.content?.orden ??
                          doc.order ??
                          0
                        ),
                      })),

                      ...lessonImages.map((img: any) => ({
                        type: 'image' as const,
                        id: img.contentId ?? img.id,
                        order: Number(
                          img.content?.order ??
                          img.content?.orden ??
                          img.order ??
                          0
                        ),
                        url: fixUrl(
                          img.imageUrl ??
                          img.url_imagen ??
                          img.url
                        ),
                        alt:
                          img.altText ??
                          img.texto_alternativo ??
                          'imagen',
                      })),
                      ...lessonVideos.map((v: any) => ({
                        type: 'video' as const,
                        id: v.contentId,
                        title: v.content?.title ?? 'Video',
                        order: Number(v.content?.order ?? 0),
                        url: v.videoUrl,
                      })),

                      ...lessonHWs.map((hw: getHomeWorkDto) => {
                        const mySubmission = submissions.find(s =>
                          s.homeworkId === hw.id &&
                          s.usuarioId === profileQuery.data?.personId
                        )
                        return {
                          type: 'homework' as const,
                          id: hw.id,
                          title: hw.titulo,
                          order: 999, // Generalmente al final
                          homework: hw,
                          submission: mySubmission
                        }
                      })
                    ].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

                    return (
                      <li
                        key={leccion.id}
                        className="flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/30 p-3"
                      >
                        {/* HEADER */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            {/*  TÍTULO */}
                            <label
                              htmlFor={`leccion-${leccion.id}`}
                              className="font-medium leading-tight cursor-pointer"
                            >
                              {leccion.titulo}
                            </label>

                            {/* ESTADO */}
                            <p className="text-xs text-muted-foreground mt-1">
                              {leccion.completada ? 'Completada' : 'Pendiente'}
                              {!yaInscrito ? ' · Requiere inscripción' : ''}
                            </p>


                            {/*  CONTENIDOS*/}
                            <div className="mt-3 space-y-2">
                              {contenidos.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                  Sin contenido
                                </p>
                              ) : (
                                contenidos.map(item => {
                                  // DOCUMENTO limpio tipo Moodle
                                  if (item.type === 'document') {
                                    return (
                                      <div
                                        key={`doc-${item.id}`}
                                        onClick={async () => {
                                          try {
                                            const res = await http.get(
                                              `/DocumentContents/GetSasUrl/${item.id}`
                                            )
                                            window.open(res.data.url, '_blank')
                                          } catch {
                                            alert('Error al abrir documento')
                                          }
                                        }}
                                        className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer transition"
                                      >
                                        {/* ICONO */}
                                        <FileText className="w-4 h-4 text-primary" />

                                        {/* TEXTO */}
                                        <span className="text-sm">
                                          {item.title}
                                        </span>
                                      </div>
                                    )
                                  }
                                  //  VIDEO
                                  if (item.type === 'video') {
                                    return (
                                      <div key={`video-${item.id}`} className="flex justify-center">
                                        {item.url ? (
                                          <video
                                            src={item.url}
                                            controls
                                            className="max-w-xl rounded-lg shadow"
                                            onError={() => console.log('❌ Error video:', item.url)}
                                          />
                                        ) : (
                                          <span className="text-xs text-red-500">
                                            Video no disponible
                                          </span>
                                        )}
                                      </div>
                                    )
                                  }

                                  // 📝 TAREA (HOMEWORK)
                                  if (item.type === 'homework') {
                                    const hw = item.homework!
                                    const sub = item.submission
                                    const isSubmitted = !!sub
                                    const isGraded = sub?.revisado

                                    return (
                                      <div
                                        key={`hw-${item.id}`}
                                        className="flex flex-col gap-2 p-3 rounded-xl border bg-card/50"
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                              <ClipboardList className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                              <span className="text-sm font-semibold block uppercase tracking-tight">
                                                Tarea: {item.title}
                                              </span>
                                              {hw.fechaLimite && (
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                  <Calendar className="w-3 h-3" />
                                                  Vence: {new Date(hw.fechaLimite).toLocaleString()}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            {isSubmitted ? (
                                              <Badge variant={isGraded ? 'default' : 'secondary'}>
                                                {isGraded ? 'Calificada' : 'Entregada'}
                                              </Badge>
                                            ) : (
                                              <Badge variant="outline" className="text-muted-foreground border-dashed">
                                                Pendiente
                                              </Badge>
                                            )}
                                          </div>
                                        </div>

                                        {hw.descripcion && (
                                          <p className="text-xs text-muted-foreground ml-11 border-l-2 border-primary/20 pl-3 py-1">
                                            {hw.descripcion}
                                          </p>
                                        )}

                                        <div className="flex justify-end mt-2">
                                          {isAuthenticated && role === 'Estudiante' && yaInscrito && (
                                            <Button
                                              size="xs"
                                              variant={isSubmitted ? 'outline' : 'default'}
                                              disabled={isSubmitted && isGraded}
                                              onClick={() => setSubmissionHomework(hw)}
                                            >
                                              {isSubmitted ? 'Ver / Editar entrega' : 'Realizar entrega'}
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  }

                                  // 🖼️ IMAGEN centrada tipo Moodle
                                  return (
                                    <div
                                      key={`img-${item.id}`}
                                      className="flex justify-center"
                                    >
                                      <img
                                        src={item.url}
                                        alt={item.alt}
                                        className="max-h-60 rounded-lg object-contain cursor-pointer"
                                        onClick={() => window.open(item.url, '_blank')}
                                        onError={(e) => {
                                          e.currentTarget.src = 'https://via.placeholder.com/300'
                                        }}
                                      />
                                    </div>
                                  )
                                })
                              )}
                            </div>

                          </div>

                          {/* BOTÓN */}
                          {yaInscrito && !terminado ? (
                            <Button
                              size="sm"
                              variant={leccion.completada ? 'outline' : 'default'}
                              disabled={leccion.completada || busy}
                              onClick={() => completeMutation.mutate(leccion.id)}
                            >
                              {busy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : leccion.completada ? (
                                'Hecha'
                              ) : (
                                'Marcar completada'
                              )}
                            </Button>
                          ) : null}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          ) : learningQuery.isLoading && isAuthenticated && role === 'Estudiante' ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {isAuthenticated && role === 'Estudiante'
                ? 'Este curso aún no tiene módulos o lecciones publicadas.'
                : 'Inicia sesión para ver el programa de lecciones y tu progreso.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* DIÁLOGO DE ENTREGA DE TAREA */}
      <Dialog open={!!submissionHomework} onOpenChange={(o) => !o && setSubmissionHomework(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Entregar Tarea</DialogTitle>
            <DialogDescription asChild>
              <div>
                {submissionHomework?.titulo}
                {submissionHomework && (
                  <div className="mt-4 p-3 bg-muted rounded-md space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-semibold text-muted-foreground uppercase opacity-70">Apertura</span>
                      <span>{new Date(submissionHomework.fechaApertura).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1 mt-1 font-medium text-destructive">
                      <span className="uppercase opacity-70">Fecha Límite</span>
                      <span>{new Date(submissionHomework.fechaEntrega).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Seleccionar archivo</label>
              <input
                type="file"
                className="w-full text-sm border rounded-lg p-2"
                onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Comentario (opcional)</label>
              <textarea
                className="w-full text-sm border rounded-lg p-2 min-h-24"
                placeholder="Escribe un comentario para tu docente..."
                value={submissionComment}
                onChange={(e) => setSubmissionComment(e.target.value)}
              />
            </div>

            {submitHomework.isError && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {getErrorMessage(submitHomework.error, 'No se pudo enviar la tarea')}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmissionHomework(null)}>
              Cancelar
            </Button>
            <Button
              disabled={!submissionFile || submitHomework.isPending}
              onClick={handleHomeworkSubmit}
            >
              {submitHomework.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : 'Enviar Tarea'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
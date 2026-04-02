import { useMemo, useState } from 'react'
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
} from 'lucide-react'

import { useCourseById } from '@/hooks/useCourses'
import { useAuthStore } from '@/store/auth.store'
import { inscriptionService } from '@/services/inscription.service'
import { studentProgressService } from '@/services/student-progress.service'
import { getApiErrorMessage } from '@/lib/api.error'
import type { Course } from '@/types/course'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5024/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

const resolveImageUrl = (course: Course | undefined) => {
  const raw = course?.imagen_url || (course as { imagenUrl?: string } | undefined)?.imagenUrl
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  return `${API_ORIGIN}${raw.startsWith('/') ? '' : '/'}${raw}`
}

function labelInscripcionEstado(raw: string | undefined | null): string {
  const e = (raw ?? '').trim().toLowerCase()
  if (e === 'activo') return 'Inscripción activa'
  if (e === 'progreso') return 'En curso'
  if (e === 'terminado') return 'Completado'
  if (e === 'cancelado') return 'Cancelada'
  return raw?.trim() || '—'
}

export function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const role = useAuthStore(s => s.role)

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

  const course = courseQuery.data
  const learning = learningQuery.data

  const heroImage = useMemo(() => resolveImageUrl(course), [course])

  const estadoInscripcion = (learning?.estadoInscripcion ?? '').toLowerCase()
  const yaInscrito = Boolean(learning?.inscrito)
  const terminado = estadoInscripcion === 'terminado'

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
          <AlertDescription>{getApiErrorMessage(courseQuery.error, 'Error desconocido')}</AlertDescription>
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
              <span className="mb-4 inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
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
                {learning?.categoriaNombre
                  ? `Categoría: ${learning.categoriaNombre}`
                  : 'Información general del curso (API de cursos).'}
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
                              {getApiErrorMessage(inscriptionMutation.error, 'No se pudo inscribir')}
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
                {getApiErrorMessage(learningQuery.error, 'Intenta de nuevo más tarde.')}
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

          {learning && yaInscrito && terminado ? (
            <div className="flex flex-wrap gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <Award className="h-6 w-6 shrink-0 text-primary" />
              <div className="flex-1 space-y-2">
                <p className="font-semibold">Certificado disponible</p>
                <p className="text-sm text-muted-foreground">
                  Descarga tu constancia en PDF con nombre, curso y fecha de finalización.
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
                    {getApiErrorMessage(certMutation.error, 'No se pudo generar el certificado')}
                  </p>
                ) : null}
              </div>
            </div>
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
              <Accordion type="multiple" className="w-full rounded-xl border border-border">
                {learning.modulos.map(mod => (
                  <AccordionItem key={mod.id} value={`m-${mod.id}`}>
                    <AccordionTrigger className="px-4 text-left hover:no-underline">
                      <span className="font-medium">{mod.titulo}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <ul className="space-y-2">
                        {mod.lecciones.map(leccion => {
                          const busy = completingLessonId === leccion.id
                          return (
                            <li
                              key={leccion.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/30 p-3"
                            >
                              <div className="flex items-start gap-3">
                                <div className="pt-0.5">
                                  <Checkbox
                                    id={`leccion-${leccion.id}`}
                                    checked={leccion.completada}
                                    disabled={!yaInscrito || terminado || busy || leccion.completada}
                                    onCheckedChange={val => {
                                      if (val === true && yaInscrito && !terminado && !leccion.completada) {
                                        completeMutation.mutate(leccion.id)
                                      }
                                    }}
                                    aria-label={`Lección completada: ${leccion.titulo}`}
                                  />
                                </div>
                                <div>
                                  <label
                                    htmlFor={`leccion-${leccion.id}`}
                                    className="font-medium leading-tight cursor-pointer"
                                  >
                                    {leccion.titulo}
                                  </label>
                                  <p className="text-xs text-muted-foreground">
                                    {leccion.completada ? 'Completada' : 'Pendiente'}
                                    {!yaInscrito ? ' · Requiere inscripción' : ''}
                                  </p>
                                </div>
                              </div>
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
                            </li>
                          )
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
    </div>
  )
}

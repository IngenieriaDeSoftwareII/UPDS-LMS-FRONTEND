import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, ImageOff, Loader2, ServerCrash, Trash2 } from 'lucide-react'

import http from '@/lib/http'
import { inscriptionService } from '@/services/inscription.service'
import { studentProgressService } from '@/services/student-progress.service'
import { getApiErrorMessage } from '@/lib/api.error'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5024/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

const resolveImageUrl = (raw?: string | null) => {
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  return `${API_ORIGIN}${raw.startsWith('/') ? '' : '/'}${raw}`
}

export function MyCourses() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [cancelTarget, setCancelTarget] = useState<{ id: number; cursoId: number; titulo: string } | null>(
    null
  )

  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => http.get<{ personId: number }>('/Profile/me').then(res => res.data),
  })

  const personId = profileQuery.data?.personId

  const listQuery = useQuery({
    queryKey: ['student-my-courses', personId],
    queryFn: () => inscriptionService.getMyCourses(personId!),
    enabled: Boolean(personId),
  })

  const dashboardQuery = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => studentProgressService.getDashboard(),
    enabled: Boolean(personId),
  })

  const cancelMutation = useMutation({
    mutationFn: (payload: { usuarioId: number; cursoId: number }) => inscriptionService.cancel(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-my-courses'] })
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['student-learning'] })
      setCancelTarget(null)
    },
  })

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (profileQuery.isError || !personId) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Sesión</AlertTitle>
          <AlertDescription>Inicia sesión como estudiante para ver tus cursos.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary shadow-inner">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Aprendizaje</p>
            <h1 className="text-2xl font-bold">Mis cursos</h1>
            <p className="text-sm text-muted-foreground">Inscripciones activas y tu avance.</p>
          </div>
        </div>
      </div>

      {listQuery.isError ? (
        <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Error al cargar</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            {getApiErrorMessage(listQuery.error, 'No se pudieron obtener las inscripciones')}
            <Button variant="link" size="sm" onClick={() => listQuery.refetch()}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {listQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : listQuery.data && listQuery.data.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Sin inscripciones</CardTitle>
            <CardDescription>Explora el catálogo y elige un curso para comenzar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/student/courses')}>Ir al catálogo</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {listQuery.data?.map(ins => {
            const img = resolveImageUrl(ins.curso.imagenUrl)
            const estado = (ins.estado ?? '').toLowerCase()
            const terminado = estado === 'terminado'
            const dash = dashboardQuery.data?.find(d => d.cursoId === ins.curso.id)
            const pct = dash?.progresoPorcentaje ?? (terminado ? 100 : 0)
            return (
              <Card key={ins.id} className="overflow-hidden border border-border shadow-sm">
                <div className="flex h-36 bg-muted/50">
                  {img ? (
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImageOff className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">{ins.curso.titulo}</CardTitle>
                    <span
                      className={
                        terminado
                          ? 'shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700'
                          : 'shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-800'
                      }
                    >
                      {ins.estado}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {ins.curso.descripcion ?? 'Sin descripción'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progreso</span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    {dash ? (
                      <p className="text-xs text-muted-foreground">
                        {dash.leccionesCompletadas} / {dash.leccionesTotales} lecciones
                      </p>
                    ) : dashboardQuery.isLoading ? (
                      <p className="text-xs text-muted-foreground">Calculando avance…</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="default" onClick={() => navigate(`/student/courses/${ins.curso.id}`)}>
                      Ver curso
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-destructive hover:text-destructive disabled:opacity-50"
                      disabled={terminado}
                      title={
                        terminado
                          ? 'No se puede cancelar una inscripción ya finalizada'
                          : 'Cancelar inscripción a este curso'
                      }
                      onClick={() => {
                        cancelMutation.reset()
                        setCancelTarget({ id: ins.id, cursoId: ins.curso.id, titulo: ins.curso.titulo })
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Cancelar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Inscripción: {new Date(ins.createdAt).toLocaleDateString()}
                    {ins.fechaCompletado
                      ? ` · Completado: ${new Date(ins.fechaCompletado).toLocaleDateString()}`
                      : null}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog
        open={cancelTarget !== null}
        onOpenChange={open => {
          if (!open) {
            setCancelTarget(null)
            cancelMutation.reset()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advertencia: cancelar inscripción</DialogTitle>
            <DialogDescription className="text-left">
              Vas a eliminar tu matrícula en «{cancelTarget?.titulo}». El curso dejará de aparecer en Mis cursos y
              perderás la referencia activa a esa inscripción. Esta acción no se puede deshacer desde la plataforma.
              ¿Confirmas que deseas continuar?
            </DialogDescription>
          </DialogHeader>
          {cancelMutation.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {getApiErrorMessage(cancelMutation.error, 'No se pudo cancelar')}
              </AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setCancelTarget(null)
                cancelMutation.reset()
              }}
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              disabled={cancelMutation.isPending || !cancelTarget}
              onClick={() => {
                if (!cancelTarget) return
                cancelMutation.mutate({ usuarioId: personId, cursoId: cancelTarget.cursoId })
              }}
            >
              {cancelMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirmar cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

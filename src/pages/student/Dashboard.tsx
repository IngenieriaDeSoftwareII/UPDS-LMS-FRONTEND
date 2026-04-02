import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, GraduationCap, ImageOff, LayoutDashboard, Loader2, ServerCrash } from 'lucide-react'

import http from '@/lib/http'
import { studentProgressService } from '@/services/student-progress.service'
import { getErrorMessage } from '@/lib/api.error'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5024/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

const resolveImageUrl = (raw?: string | null) => {
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  return `${API_ORIGIN}${raw.startsWith('/') ? '' : '/'}${raw}`
}

export function StudentDashboard() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Panel del Estudiante'
  }, [])

  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => http.get<{ personId: number }>('/Profile/me').then(res => res.data),
  })

  const dashboardQuery = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => studentProgressService.getDashboard(),
    enabled: Boolean(profileQuery.data?.personId),
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary shadow-inner">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Resumen</p>
            <h1 className="text-2xl font-bold">Tu progreso académico</h1>
            <p className="text-sm text-muted-foreground">
              Vista general de todos tus cursos inscritos y avance por lecciones.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/student/courses')}>
          <BookOpen className="mr-2 h-4 w-4" /> Catálogo
        </Button>
      </div>

      {profileQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Sesión</AlertTitle>
          <AlertDescription>Inicia sesión para ver tu panel de progreso.</AlertDescription>
        </Alert>
      ) : null}

      {dashboardQuery.isError ? (
        <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>No se pudo cargar el resumen</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            {getErrorMessage(dashboardQuery.error, 'Error al obtener el dashboard')}
            <Button variant="link" size="sm" onClick={() => dashboardQuery.refetch()}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {dashboardQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : dashboardQuery.data && dashboardQuery.data.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" /> Aún no tienes cursos
            </CardTitle>
            <CardDescription>Inscríbete desde el catálogo para ver tu progreso aquí.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/student/courses')}>Explorar cursos</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {dashboardQuery.data?.map(row => {
            const img = resolveImageUrl(row.imagenUrl)
            const estado = (row.estadoInscripcion ?? '').toLowerCase()
            return (
              <Card
                key={row.cursoId}
                className="cursor-pointer overflow-hidden border border-border transition hover:shadow-md"
                onClick={() => navigate(`/student/courses/${row.cursoId}`)}
              >
                <div className="flex h-32 bg-muted/50">
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
                    <CardTitle className="text-lg leading-tight">{row.titulo}</CardTitle>
                    <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs capitalize text-secondary-foreground">
                      {row.estadoInscripcion}
                    </span>
                  </div>
                  <CardDescription>
                    {row.leccionesCompletadas} de {row.leccionesTotales} lecciones ·{' '}
                    {estado === 'terminado' && row.fechaCompletado
                      ? `Finalizado el ${new Date(row.fechaCompletado).toLocaleDateString()}`
                      : 'En progreso'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Avance</span>
                    <span className="tabular-nums font-medium text-foreground">{row.progresoPorcentaje}%</span>
                  </div>
                  <Progress value={row.progresoPorcentaje} className="h-2" />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {dashboardQuery.isFetching && !dashboardQuery.isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Actualizando…
        </div>
      ) : null}
    </div>
  )
}

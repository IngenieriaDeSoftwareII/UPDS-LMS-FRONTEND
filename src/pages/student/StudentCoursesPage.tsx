import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, CheckCircle2, Clock4, Gauge, ImageOff, Search, ServerCrash, Sparkles, Users } from 'lucide-react'

import { getApiErrorMessage } from '@/lib/api.error'
import { useCourses } from '@/hooks/useCourses'

import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5024/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

const resolveImageUrl = (image?: string) => {
  if (!image) return ''
  if (/^https?:\/\//i.test(image)) return image
  return `${API_ORIGIN}${image.startsWith('/') ? '' : '/'}${image}`
}

export function StudentCoursesPage() {
  const navigate = useNavigate()
  const { data: courses = [], isLoading, isError, error, refetch } = useCourses()
  const [searchTerm, setSearchTerm] = useState('')
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})

  const publishedCourses = useMemo(() => courses.filter(course => course.publicado), [courses])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return publishedCourses
    return publishedCourses.filter(course => {
      const title = course.titulo?.toLowerCase() || ''
      const desc = course.descripcion?.toLowerCase() || ''
      return title.includes(term) || desc.includes(term)
    })
  }, [publishedCourses, searchTerm])

  const totalMinutes = useMemo(() => publishedCourses.reduce((acc, course) => acc + (course.duracion_total_min || 0), 0), [publishedCourses])

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary shadow-inner">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Explora</p>
            <h1 className="text-2xl font-bold">Cursos publicados</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} resultado(s) • {publishedCourses.length} publicados</p>
          </div>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o descripción..."
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card/70 px-4 py-3 shadow-inner">
          <Gauge className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
          <div>
            <p className="text-xs uppercase text-muted-foreground">Cursos activos</p>
            <p className="text-lg font-semibold">{publishedCourses.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card/70 px-4 py-3 shadow-inner">
          <Clock4 className="h-5 w-5 text-amber-600 dark:text-amber-300" />
          <div>
            <p className="text-xs uppercase text-muted-foreground">Duración total</p>
            <p className="text-lg font-semibold">{Math.round(totalMinutes / 60)} h</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card/70 px-4 py-3 shadow-inner">
          <Users className="h-5 w-5 text-sky-600 dark:text-sky-300" />
          <div>
            <p className="text-xs uppercase text-muted-foreground">Cupo promedio</p>
            <p className="text-lg font-semibold">{publishedCourses.length ? Math.round((publishedCourses.reduce((acc, c) => acc + (c.max_estudiantes ?? 0), 0) / publishedCourses.length)) : 0}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-border bg-muted/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">Catálogo visual</CardTitle>
            <CardDescription>Descubre cursos disponibles y accede a sus detalles.</CardDescription>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Datos en solo lectura
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isError ? (
            <Alert variant="destructive" className="mb-4">
              <ServerCrash className="h-4 w-4" />
              <AlertTitle>Error al cargar registros</AlertTitle>
              <AlertDescription className="flex items-center gap-2">
                {getApiErrorMessage(error, 'Error al cargar los cursos')}
                <Button variant="link" size="sm" onClick={() => refetch()}>Reintentar</Button>
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
                  <Skeleton className="h-36 w-full" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
              No se encontraron cursos publicados con ese criterio.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(course => {
                const image = resolveImageUrl(course.imagen_url)
                const showImage = image && !brokenImages[String(course.id)]

                return (
                  <div key={course.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card/70 shadow-xl shadow-black/5 dark:shadow-black/40">
                    <div className="h-40 w-full overflow-hidden bg-linear-to-br from-muted to-muted/80">
                      {showImage ? (
                        <img
                          src={image}
                          alt={course.titulo}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={() => setBrokenImages(prev => ({ ...prev, [String(course.id)]: true }))}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center gap-2 text-sm text-muted-foreground">
                          <ImageOff className="h-5 w-5" /> Sin imagen
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Nivel {course.nivel}</p>
                          <h3 className="text-lg font-semibold leading-tight">{course.titulo}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{course.descripcion || 'Sin descripción'}</p>
                        </div>
                        <Badge variant="outline" className="text-xs font-medium border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">
                          <CheckCircle2 className="mr-1 h-4 w-4" /> Publicado
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-foreground">
                        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
                          <p className="text-[11px] uppercase text-muted-foreground">Duración</p>
                          <p className="font-medium">{course.duracion_total_min} min</p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
                          <p className="text-[11px] uppercase text-muted-foreground">Cupo máx</p>
                          <p className="font-medium">{course.max_estudiantes ?? '—'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-muted-foreground">ID: {course.id}</div>
                        <Button variant="secondary" size="sm" className="gap-2" onClick={() => navigate(`/student/courses/${course.id}`)}>
                          <Sparkles className="h-4 w-4" /> Ver detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
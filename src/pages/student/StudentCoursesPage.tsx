import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, CheckCircle2, Clock4, ImageOff, Search, ServerCrash, Sparkles, Users } from 'lucide-react'

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
    <div className="space-y-4 p-4 md:p-5 bg-[radial-gradient(circle_at_20%_10%,rgba(6,182,212,0.18),transparent_26%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.16),transparent_28%)] text-sky-950 dark:bg-[radial-gradient(circle_at_20%_8%,rgba(34,211,238,0.2),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.2),transparent_24%),linear-gradient(180deg,rgba(2,6,23,1)_0%,rgba(10,20,45,1)_100%)] dark:text-sky-100">
      <div className="overflow-hidden rounded-2xl border border-sky-500/20 bg-linear-to-r from-cyan-500/20 via-sky-500/15 to-blue-600/20 p-4 shadow-xl shadow-cyan-500/10 backdrop-blur dark:border-cyan-300/20 dark:from-cyan-400/20 dark:via-blue-500/20 dark:to-indigo-500/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/15 p-2.5 text-cyan-700 dark:border-cyan-300/30 dark:bg-cyan-300/15 dark:text-cyan-100">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">Pestaña activa</p>
              <h1 className="text-xl font-semibold text-sky-900 dark:text-sky-100">Cursos publicados</h1>
              <p className="text-xs text-sky-800 dark:text-sky-200">Vista de exploración rápida por cursos individuales</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="h-9 gap-2 px-3 text-xs border-amber-400/35 bg-white/70 text-amber-900 hover:bg-amber-50 dark:border-amber-300/30 dark:bg-slate-900/70 dark:text-amber-100 dark:hover:bg-amber-400/10" onClick={() => navigate('/student/categories-list')}>
              <Sparkles className="h-4 w-4" /> Categorías
            </Button>
            <Button className="h-9 gap-2 px-3 text-xs bg-cyan-500 text-white hover:bg-cyan-600 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300">
              <BookOpen className="h-4 w-4" /> Cursos
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          <div className="rounded-xl border border-cyan-500/20 bg-white/65 px-3 py-2.5 dark:border-cyan-300/20 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-wide text-sky-700 dark:text-sky-300">Cursos activos</p>
            <p className="mt-1 text-2xl font-semibold text-sky-900 dark:text-sky-100">{publishedCourses.length}</p>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-white/65 px-3 py-2.5 dark:border-blue-300/20 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-wide text-sky-700 dark:text-sky-300">Duración total</p>
            <p className="mt-1 text-2xl font-semibold text-sky-900 dark:text-sky-100">{Math.round(totalMinutes / 60)} h</p>
          </div>
          <div className="rounded-xl border border-indigo-500/20 bg-white/65 px-3 py-2.5 dark:border-indigo-300/20 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-wide text-sky-700 dark:text-sky-300">Cupo promedio</p>
            <p className="mt-1 text-2xl font-semibold text-sky-900 dark:text-sky-100">
              {publishedCourses.length ? Math.round((publishedCourses.reduce((acc, c) => acc + (c.max_estudiantes ?? 0), 0) / publishedCourses.length)) : 0}
            </p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border border-sky-500/20 bg-background/85 shadow-xl shadow-cyan-500/10 dark:border-cyan-300/20 dark:bg-slate-900/85">
        <CardHeader className="border-b border-sky-500/20 bg-linear-to-r from-cyan-500/10 via-background to-blue-500/10 pb-4 dark:border-cyan-300/20 dark:from-cyan-400/10 dark:via-slate-900 dark:to-blue-500/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-xl text-sky-900 dark:text-sky-100">Stream de cursos</CardTitle>
              <CardDescription className="text-sm text-sky-800 dark:text-sky-200">Cada fila representa un curso con acceso directo al detalle.</CardDescription>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
              <Input
                placeholder="Buscar por título o descripción..."
                className="h-10 pl-9 text-sm dark:border-cyan-300/20 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-5">
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
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/70 bg-muted/40 p-3">
                  <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-11/12" />
                      <Skeleton className="h-4 w-9/12" />
                      <Skeleton className="h-9 w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-sky-500/30 bg-cyan-500/5 p-10 text-center text-sky-800 dark:border-cyan-300/25 dark:bg-cyan-400/8 dark:text-sky-200">
              No se encontraron cursos publicados con ese criterio.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(course => {
                const image = resolveImageUrl(course.imagen_url)
                const showImage = image && !brokenImages[String(course.id)]

                return (
                  <article key={course.id} className="group overflow-hidden rounded-2xl border border-sky-500/20 bg-linear-to-r from-white to-cyan-50/35 shadow-lg shadow-cyan-500/5 transition duration-300 hover:shadow-cyan-500/15 dark:border-cyan-300/20 dark:from-slate-900 dark:to-cyan-950/25">
                    <div className="grid gap-3 p-3 md:grid-cols-[180px_minmax(0,1fr)] md:p-4">
                      <div className="h-32 overflow-hidden rounded-xl border border-border/70 bg-linear-to-br from-muted to-muted/80 md:h-full">
                        {showImage ? (
                          <img
                            src={image}
                            alt={course.titulo}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => setBrokenImages(prev => ({ ...prev, [String(course.id)]: true }))}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center gap-2 text-xs text-sky-700 dark:text-sky-300">
                            <ImageOff className="h-5 w-5" /> Sin imagen
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1.5">
                            <p className="text-xs uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">Nivel {course.nivel}</p>
                            <h3 className="text-lg font-semibold leading-tight text-sky-900 dark:text-sky-100">{course.titulo}</h3>
                            <p className="line-clamp-2 text-xs text-sky-800 dark:text-sky-200">{course.descripcion || 'Sin descripción'}</p>
                          </div>
                          <Badge variant="outline" className="border-emerald-500/35 bg-emerald-500/10 text-xs font-medium text-emerald-700 dark:border-emerald-300/30 dark:bg-emerald-300/12 dark:text-emerald-200">
                            <CheckCircle2 className="mr-1 h-4 w-4" /> Publicado
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg border border-blue-500/20 bg-blue-500/8 px-2.5 py-2 dark:border-blue-300/20 dark:bg-blue-300/10">
                            <p className="text-[11px] uppercase tracking-wide text-sky-700 dark:text-sky-300">Duración</p>
                            <p className="font-semibold text-sky-900 dark:text-sky-100">{course.duracion_total_min} min</p>
                          </div>
                          <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/8 px-2.5 py-2 dark:border-indigo-300/20 dark:bg-indigo-300/10">
                            <p className="text-[11px] uppercase tracking-wide text-sky-700 dark:text-sky-300">Cupo máx</p>
                            <p className="font-semibold text-sky-900 dark:text-sky-100">{course.max_estudiantes ?? '—'}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-0.5">
                          <div className="flex items-center gap-2 text-xs text-sky-700 dark:text-sky-300">
                            <Users className="h-4 w-4" /> ID {course.id}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="hidden items-center gap-1 text-xs text-sky-700 md:inline-flex dark:text-sky-300">
                              <Clock4 className="h-4 w-4" /> Vista rápida
                            </span>
                            <Button size="sm" className="h-8 gap-2 px-3 text-xs bg-cyan-500 text-white hover:bg-cyan-600 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300" onClick={() => navigate(`/student/courses/${course.id}`)}>
                              <Sparkles className="h-4 w-4" /> Ver detalles
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
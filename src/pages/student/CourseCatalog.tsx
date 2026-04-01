import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ImageOff, Search, ServerCrash } from 'lucide-react'

import { useCourses } from '@/hooks/useCourses'
import { getApiErrorMessage } from '@/lib/api.error'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5024/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

const resolveImageUrl = (image?: string) => {
  if (!image) return ''
  if (/^https?:\/\//i.test(image)) return image
  return `${API_ORIGIN}${image.startsWith('/') ? '' : '/'}${image}`
}

export default function CourseCatalog() {
  const navigate = useNavigate()
  const { data: courses = [], isLoading, isError, error, refetch } = useCourses()
  const [search, setSearch] = useState('')
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})

  const published = useMemo(() => courses.filter(course => course.publicado), [courses])
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return published
    return published.filter(course => {
      const title = course.titulo?.toLowerCase() || ''
      const desc = course.descripcion?.toLowerCase() || ''
      return title.includes(term) || desc.includes(term)
    })
  }, [published, search])

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary shadow-inner">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Catálogo</p>
            <h1 className="text-2xl font-bold">Cursos disponibles</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} resultado(s) • {published.length} publicados</p>
          </div>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar curso..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 border-b border-border bg-muted/40">
          <CardTitle className="text-lg">Explora y elige</CardTitle>
          <CardDescription>Haz clic en un curso para ver sus detalles y gestionar tu inscripción.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isError ? (
            <Alert variant="destructive" className="mb-4">
              <ServerCrash className="h-4 w-4" />
              <AlertTitle>Error al cargar cursos</AlertTitle>
              <AlertDescription className="flex items-center gap-2">
                {getApiErrorMessage(error, 'No se pudo cargar cursos')}
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
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
              No se encontraron cursos con ese criterio.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(course => {
                const image = resolveImageUrl(course.imagen_url)
                const showImage = image && !brokenImages[String(course.id)]

                return (
                  <Card
                    key={course.id}
                    className="group cursor-pointer overflow-hidden border border-border bg-card/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                    onClick={() => navigate(`/student/courses/${course.id}`)}
                  >
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
                    <CardContent className="space-y-2 p-4">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{course.nivel}</span>
                      <h2 className="font-semibold text-lg leading-tight">{course.titulo}</h2>
                      <p className="text-xs text-muted-foreground">⏱ {Math.floor(course.duracion_total_min / 60)} h</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
      </div>
    </div>
  )
}
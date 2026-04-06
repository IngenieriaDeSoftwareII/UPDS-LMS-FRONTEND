import { useNavigate } from 'react-router-dom'
import { BookOpen, ImageOff, ArrowRight } from 'lucide-react'
import { useTeacherProfile } from '@/hooks/useTeacherProfile'
import { useTeacherCourses } from '@/hooks/useCourses'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5024/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export function TeacherLessonsSelectionPage() {
  const navigate = useNavigate()
  const { data: profile, isLoading: loadingProfile, isError: errorProfile } = useTeacherProfile()
  const { data: courses, isLoading: loadingCourses, isError: errorCourses } = useTeacherCourses(profile?.teacherId)

  const resolveImageUrl = (raw?: string | null) => {
    if (!raw) return ''
    if (/^https?:\/\//i.test(raw)) return raw
    return `${API_ORIGIN}${raw.startsWith('/') ? '' : '/'}${raw}`
  }

  if (loadingProfile || (loadingCourses && profile?.teacherId)) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (errorProfile || errorCourses) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No se pudieron cargar tus cursos asignados.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <BookOpen className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Lecciones</h1>
          <p className="text-muted-foreground text-lg">
            Selecciona un curso para gestionar sus módulos, lecciones y contenidos.
          </p>
        </div>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl border-border/60">
          <p className="text-xl text-muted-foreground font-medium">No tienes cursos asignados actualmente.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const img = resolveImageUrl(course.imagen_url || (course as any).imagenUrl)
            return (
              <Card key={course.id} className="group overflow-hidden rounded-2xl border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-40 bg-muted/30 overflow-hidden">
                  {img ? (
                    <img
                      src={img}
                      alt={course.titulo}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground/40">
                      <ImageOff className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                </div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                      {course.nivel || 'Nivel —'}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">{course.titulo}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                    {course.descripcion || 'Sin descripción disponible para este curso.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full group/btn rounded-xl"
                    onClick={() => navigate(`/teacher/lessons/${course.id}`)}
                  >
                    Gestionar Lecciones
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

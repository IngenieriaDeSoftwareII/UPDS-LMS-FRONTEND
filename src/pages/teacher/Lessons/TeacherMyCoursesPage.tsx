import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, ImageOff, ServerCrash } from 'lucide-react'

import http from '@/lib/http'
import { teacherService } from '@/services/teacher.service'
import { coursePruebaService } from '@/services/coursePrueba.service'
import { getErrorMessage } from '@/lib/api.error'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5024/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

const resolveImageUrl = (raw?: string | null) => {
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  return `${API_ORIGIN}${raw.startsWith('/') ? '' : '/'}${raw}`
}

export function TeacherMyCoursesPage() {
  const navigate = useNavigate()

  // 🔹 1. Obtener perfil
  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => http.get<{ personId: number }>('/Profile/me').then(res => res.data),
  })

  const personId = profileQuery.data?.personId

  // 🔹 2. Obtener teacher por personId
  const teacherQuery = useQuery({
    queryKey: ['teacher-by-person', personId],
    queryFn: async () => {
      const teachers = await teacherService.getAll()
      return teachers.find(t => t.usuario_id === personId)
    },
    enabled: !!personId,
  })

  const teacherId = teacherQuery.data?.id

  // 🔹 3. Obtener cursos del docente
  const coursesQuery = useQuery({
    queryKey: ['courses-teacher', teacherId],
    queryFn: () => coursePruebaService.getByTeacher(teacherId!),
    enabled: !!teacherId,
  })

  // 🔴 4. Redirección si no tiene cursos
  useEffect(() => {
    if (coursesQuery.isSuccess && coursesQuery.data.length === 0) {
      navigate('/teacher/courses')
    }
  }, [coursesQuery.isSuccess, coursesQuery.data, navigate])

  // 🔹 Loading general
  if (profileQuery.isLoading || teacherQuery.isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  // 🔹 Error de sesión
  if (profileQuery.isError || !personId) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Sesión</AlertTitle>
          <AlertDescription>Inicia sesión como docente.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // 🔹 Error teacher
  if (!teacherId) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No se encontró el docente.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Mis cursos creados</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los cursos que has creado.
          </p>
        </div>
      </div>

      {/* ERROR */}
      {coursesQuery.isError && (
        <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Error al cargar</AlertTitle>
          <AlertDescription>
            {getErrorMessage(coursesQuery.error, 'No se pudieron obtener los cursos')}
          </AlertDescription>
        </Alert>
      )}

      {/* LOADING */}
      {coursesQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {coursesQuery.data?.map(course => {
            const img = resolveImageUrl(course.imagen_url)

            return (
              <Card key={course.id} className="overflow-hidden">
                {/* Imagen */}
                <div className="h-36 bg-muted/50">
                  {img ? (
                    <img src={img} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ImageOff className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle>{course.titulo}</CardTitle>
                  <CardDescription>
                    {course.descripcion ?? 'Sin descripción'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/teacher/courses/${course.id}`)}
                  >
                    Ver
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/teacher/courses/edit/${course.id}`)}
                  >
                    Editar
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
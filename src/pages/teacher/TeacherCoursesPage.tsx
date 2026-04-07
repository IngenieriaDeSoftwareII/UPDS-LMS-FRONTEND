import { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, ServerCrash, Search, BookOpen, GraduationCap, Clock, Users } from 'lucide-react'
import { Pencil, ServerCrash, Search, Eye } from 'lucide-react'
import { toast } from 'sonner'

import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '@/lib/api.error'
import { useTeacherCourses, useUpdateCourse } from '@/hooks/useCourses'
import { useTeacherProfile } from '@/hooks/useTeacherProfile'
import type { Course } from '@/types/course'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ─── IMPORTANTE: Obtén el ID del docente desde tu contexto de autenticación ───
// Ajusta esto según cómo manejes la autenticación en tu proyecto
const useCurrentTeacherId = () => {
  const { data: profile } = useTeacherProfile()
  return profile?.teacherId
}

// ─── Validación para DOCENTE (solo campos permitidos) ─────────────────────────
const teacherCourseSchema = z.object({
  descripcion: z.string().optional(),
  publicado: z.boolean(),
})

type FormValues = z.infer<typeof teacherCourseSchema>

function CourseForm({
  course,
  onSubmit,
  isPending,
}: {
  course: Course
  onSubmit: (data: FormValues) => void
  isPending: boolean
}) {
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(teacherCourseSchema),
    defaultValues: {
      descripcion: course.descripcion ?? '',
      publicado: course.publicado,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      {/* Información de solo lectura */}
      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Información del Curso</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Título:</span>
            <p className="mt-1">{course.titulo}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Nivel:</span>
            <p className="mt-1">{course.nivel}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Duración:</span>
            <p className="mt-1">{course.duracion_total_min} minutos</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Máx. Estudiantes:</span>
            <p className="mt-1">{course.max_estudiantes ?? 'Sin límite'}</p>
          </div>
        </div>
      </div>

      {/* Campos editables por el docente */}
      <Controller
        name="descripcion"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Descripción</FieldLabel>
            <Input {...field} placeholder="Descripción del curso" />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="publicado"
        control={control}
        render={({ field }) => (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">Publicar curso (visible para estudiantes)</span>
          </label>
        )}
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  )
}

function EditCourseDialog({ course }: { course: Course }) {
  const { mutate, isPending } = useUpdateCourse()
  const [open, setOpen] = useState(false)

  const handleSubmit = (values: FormValues) => {
    // Enviar todos los campos requeridos, no solo los que el docente puede editar
    mutate(
      {
        id: course.id,
        data: {
          id: course.id,  // ✅ OBLIGATORIO: Backend requiere el ID en el body
          titulo: course.titulo,
          descripcion: values.descripcion ?? '',
          nivel: course.nivel,
          imagenUrl: course.imagen_url,
          docenteId: course.docenteId,
          categoriaId: course.categoriaId,
          publicado: values.publicado,
          duracionTotalMin: course.duracion_total_min,
          maxEstudiantes: course.max_estudiantes,
        } as any,
      },
      {
        onSuccess: () => {
          toast.success('Curso actualizado correctamente')
          setOpen(false)
        },
        onError: (err) => {
          console.error('❌ Error en UPDATE (Docente):', err)
          toast.error(getApiErrorMessage(err, 'Error al actualizar el curso'))
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Editar curso">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Curso Asignado</DialogTitle>
          <DialogDescription>
            Como docente puedes modificar la descripción y el estado de publicación del curso.
            Los demás datos solo pueden ser editados por el administrador.
          </DialogDescription>
        </DialogHeader>
        <CourseForm course={course} onSubmit={handleSubmit} isPending={isPending} />
      </DialogContent>
    </Dialog>
  )
}

export function TeacherCoursesPage() {
  const teacherId = useCurrentTeacherId()
  const { data: courses, isLoading, isError, error, refetch } = useTeacherCourses(teacherId)
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = useMemo(() => {
    if (!courses) return []
    if (!searchTerm) return courses
    const term = searchTerm.toLowerCase()
    return courses.filter(
      (c: Course) =>
        c.titulo.toLowerCase().includes(term) ||
        c.descripcion?.toLowerCase().includes(term)
    )
  }, [courses, searchTerm])

  // Estadísticas
  const totalCourses = courses?.length ?? 0
  const publishedCourses = courses?.filter((c: Course) => c.publicado).length ?? 0
  const totalDuration = courses?.reduce((acc: number, c: Course) => acc + (c.duracion_total_min || 0), 0) ?? 0
  const avgDuration = totalCourses > 0 ? Math.round(totalDuration / totalCourses) : 0
  const totalCapacity = courses?.reduce((acc: number, c: Course) => acc + (c.max_estudiantes || 0), 0) ?? 0
  const navigate = useNavigate()
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mis Cursos Asignados</h2>
          <p className="text-muted-foreground">
            Administra y edita los cursos que dictas (Lectura/Edición).
          </p>
        </div>
      </div>

  return (
    <div className="space-y-6">

      {/* Header - Mismo estilo que CoursesPage */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary shadow-inner">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Docente</p>
            <h1 className="text-2xl font-bold">Mis Cursos Asignados</h1>
            <p className="text-sm text-muted-foreground">
              Administra y edita los cursos que dictas (lectura y edición limitada).
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por título o descripción..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas - Mismo estilo que CoursesPage */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total cursos</p>
          <div className="mt-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{totalCourses}</p>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Cursos publicados</p>
          <div className="mt-2 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{publishedCourses}</p>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Duración promedio</p>
          <div className="mt-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{avgDuration} min</p>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Capacidad total</p>
          <div className="mt-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{totalCapacity}</p>
          </div>
        </div>
      </div>

      {/* Tabla - Mismo estilo que CoursesPage */}
      <Card className="border border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="border-b border-border bg-muted/40">
          <CardTitle className="text-lg">Cursos asignados</CardTitle>
          <CardDescription>
            {filtered.length} resultado(s) sobre {totalCourses} cursos y {publishedCourses} publicados.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6">
              <Alert variant="destructive">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Error al cargar registros</AlertTitle>
                <AlertDescription className="flex flex-wrap items-center gap-2">
                  {getApiErrorMessage(error, 'Error al cargar los cursos')}
                  <Button variant="link" size="sm" onClick={() => refetch()}>
                    Reintentar
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          ) : isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : !courses || courses.length === 0 ? (
            <div className="p-6">
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>Sin cursos asignados</CardTitle>
                  <CardDescription>
                    {teacherId === null
                      ? 'No se pudo identificar tu cuenta de docente. Por favor, inicia sesión nuevamente.'
                      : 'No tienes cursos asignados actualmente.'}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6">
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>Sin resultados</CardTitle>
                  <CardDescription>No se encontraron cursos para el criterio de búsqueda.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Limpiar búsqueda
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="rounded-lg border dark:border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-48">Título</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-24 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((course: Course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{course.titulo}</p>
                        {course.descripcion && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{course.descripcion}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
                          {course.nivel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        {course.duracion_total_min} min
                      </TableCell>
                      <TableCell>
                        <Badge variant={course.publicado ? 'default' : 'secondary'}>
                          {course.publicado ? 'Publicado' : 'Borrador'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <EditCourseDialog course={course} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  ) : (
                    filtered.map((course: Course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.titulo}</TableCell>
                        <TableCell>{course.nivel}</TableCell>
                        <TableCell>{course.duracion_total_min} min</TableCell>
                        <TableCell>
                          <Badge variant={course.publicado ? 'default' : 'secondary'}>
                            {course.publicado ? 'Publicado' : 'Borrador'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <EditCourseDialog course={course} />
                          <Button variant="ghost" size="icon" title="Ver curso"
                            onClick={() => {
                              navigate(`/teacher/lessons/${course.id}`)
                            }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>

                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
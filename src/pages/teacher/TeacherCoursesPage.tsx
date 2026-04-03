import { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, ServerCrash, Search } from 'lucide-react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api.error'
import { useTeacherCourses, useUpdateCourse } from '@/hooks/useCourses'
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
  // TODO: Reemplaza esto con tu lógica real de autenticación
  // Ejemplo: const { user } = useAuth(); return user?.teacherId || user?.id;
  const [teacherId] = useState(() => {
    // Esto es un placeholder - reemplázalo con tu implementación real
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      return user.id // o user.teacher_id según tu estructura
    }
    return null
  })
  return teacherId
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
              onChange={field.onChange}
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
    mutate(
      {
        id: course.id,
        data: {
          descripcion: values.descripcion,
          publicado: values.publicado,
        },
      },
      {
        onSuccess: () => {
          toast.success('Curso actualizado correctamente')
          setOpen(false)
        },
        onError: (err) => {
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

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle className="text-xl">Listado de Mis Cursos</CardTitle>
            <CardDescription>
              Consulta y edita los cursos a los que estás asignado.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar curso por título o descripción..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {isError ? (
            <Alert variant="destructive" className="mb-4">
              <ServerCrash className="h-4 w-4" />
              <AlertTitle>Error al cargar registros</AlertTitle>
              <AlertDescription className="flex items-center gap-2 flex-wrap">
                {getApiErrorMessage(error, 'Ocurrió un error al cargar los cursos')}
                <Button variant="link" onClick={() => refetch()} className="px-2">
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !courses || courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tienes cursos asignados actualmente.
              {teacherId === null && (
                <p className="text-sm mt-2">
                  No se pudo identificar tu cuenta de docente. Por favor, inicia sesión nuevamente.
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">Título</TableHead>
                    <TableHead className="w-[20%]">Nivel</TableHead>
                    <TableHead className="w-[15%]">Duración</TableHead>
                    <TableHead className="w-[15%]">Estado</TableHead>
                    <TableHead className="w-[15%] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {searchTerm
                          ? 'No se encontraron cursos con ese criterio de búsqueda.'
                          : 'No tienes cursos asignados actualmente.'}
                      </TableCell>
                    </TableRow>
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
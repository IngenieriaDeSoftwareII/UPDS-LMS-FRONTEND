import { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Pencil, BookOpen, ServerCrash, Search } from 'lucide-react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api.error'

import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourse } from '@/hooks/useCourses'
import { useUsers } from '@/hooks/useUsers'
import { usePersons } from '@/hooks/usePersons'
import { useTeachers } from '@/hooks/useTeachers'
import { teacherService } from '@/services/teacher.service'
import type { Course } from '@/types/course'

import { Button } from '@/components/ui/button'
import { ConfirmDeleteButton } from '@/components/common/ConfirmDeleteButton'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
import { Combobox } from '@/components/ui/combobox'
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

// ─── Schema ──────────────────────────────────────────────────────────────

const courseSchema = z.object({
  titulo: z.string().min(1, 'Requerido').max(200),
  descripcion: z.string().optional(),
  nivel: z.string().min(1, 'Requerido'),
  imagen_url: z.string().optional(),
  docenteId: z.any().refine(val => val !== undefined && val !== null && val !== '' && val !== 0, { message: 'Debes asignar un docente al curso' }),
  publicado: z.boolean(),
  duracion_total_min: z.coerce.number().min(0),
  max_estudiantes: z.coerce.number().min(0).optional(),
})

type FormValues = z.infer<typeof courseSchema>

function CourseForm({
  defaultValues,
  onSubmit,
  isPending,
  onCancel,
}: {
  defaultValues: Partial<FormValues>
  onSubmit: (values: FormValues) => void
  isPending: boolean
  onCancel: () => void
}) {
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: {
      titulo: '',
      descripcion: '',
      nivel: 'Básico',
      imagen_url: '',
      docenteId: undefined,
      publicado: false,
      duracion_total_min: 60,
      max_estudiantes: undefined,
      ...defaultValues,
    },
  })

  const { data: users, isLoading: isLoadingUsers } = useUsers()
  const { data: persons, isLoading: isLoadingPersons } = usePersons()
  const { data: teachers, isLoading: isLoadingTeachers } = useTeachers()
  const isLoadingData = isLoadingUsers || isLoadingPersons || isLoadingTeachers

  const docenteOptions = useMemo(() => {
    if (!users || !persons || !teachers) return []

    // Filtrar los usuarios que son de rol Docente
    const docenteUsers = users.filter((user) => {
      const role = String((user as any).role ?? (user as any).Role ?? '').trim().toLowerCase()
      return role === 'docente'
    })

    return docenteUsers.map((user) => {
      const typedUser = user as any
      // El ID de usuario sabemos de antemano que es un string (GUID o un alphanumeric ID) directamente del User
      let userIdStr = String(typedUser.id ?? typedUser.Id)
      
      // Asegurarse de no utilizar el PersonId (usualmente un número local DB que rompía el request al POST del Teacher)
      if (!userIdStr || userIdStr === 'undefined') return null

      // Revisar si ya están creados en la tabla Teachers.
      // Aquí validamos comparando siempre String(teacher.usuarioId) que es la llave UUID.
      const teacherMatch = teachers.find(t => String(t.usuarioId) === userIdStr)
      
      // Si tiene Teacher, enviamos el ID numérico del maestro (dbo.docentes.id) para crear el curso
      // Si no, enviamos su GUID original string de identidad como value, que servirá para crearlo al vuelo
      const finalValue = teacherMatch ? Number(teacherMatch.id) : userIdStr

      return {
        value: finalValue,
        label: typedUser.fullName ?? typedUser.Email ?? `Usuario Docente`,      
      }
    }).filter(opt => opt !== null) as {value: string | number, label: string}[]
  }, [users, persons, teachers])
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="titulo"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Título</FieldLabel>
                <Input {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="docenteId"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Docente Asignado</FieldLabel>
                <Combobox
                  options={docenteOptions}
                  value={field.value ?? undefined}
                  onChange={(val) => field.onChange(val)}
                  placeholder={isLoadingData ? "Cargando..." : "Seleccionar docente..."}
                  searchPlaceholder="Buscar docente..."
                  emptyText="No se encontraron docentes"
                  disabled={isLoadingData}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <Controller
          name="descripcion"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Descripción</FieldLabel>
              <Input {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="nivel"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Nivel</FieldLabel>
                <Input {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="duracion_total_min"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Duración (min)</FieldLabel>
                <Input type="number" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <Controller
          name="imagen_url"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Imagen URL</FieldLabel>
              <Input {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="max_estudiantes"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Máx. Estudiantes</FieldLabel>
              <Input type="number" {...field} value={field.value ?? ''} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="publicado"
          control={control}
          render={({ field }) => (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              Publicado
            </label>
          )}
        />

      </FieldGroup>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

// ─── Página Principal ─────────────────────────────────────────────────────

export function CoursesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editCourse, setEditCourse] = useState<Course | null>(null)
  const [search, setSearch] = useState('')

  const { data: courses, isLoading, error } = useCourses()

  const { mutate: createCourse, isPending: isCreating } = useCreateCourse()
  const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse()
  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse()

  const filteredCourses = useMemo(() => {
    if (!courses) return []
    const q = search.toLowerCase()
    if (!q) return courses
    return courses.filter(c => c.titulo.toLowerCase().includes(q))
  }, [courses, search])

  // ─── Handlers ─────────────────────────────────────────────────────

  const handleCreate = async (values: FormValues) => {
    let finalDocenteId = values.docenteId
    
    // Si finalDocenteId es un string (UUID del usuario), significa que es un usuario docente que NO
    // ha sido registrado en la tabla Teachers, por lo que creamos ese registro al vuelo primero.
    if (typeof finalDocenteId === 'string' && finalDocenteId !== '') {
      try {
        const newTeacher = await teacherService.create({ usuarioId: finalDocenteId, especialidad: 'Designado Auto', anios_experiencia: 0 })
        finalDocenteId = newTeacher.id // Este sí es numérico porque es el ID generado por dbo.docentes
      } catch (err) {
        toast.error('Error auto-registrando la cuenta de Docente en base de datos. Completa en Menú de Profesores.')
        return
      }
    }

    const payload = {
      titulo: values.titulo,
      descripcion: values.descripcion,
      nivel: values.nivel,
      imagen_url: values.imagen_url,
      docente_id: Number(finalDocenteId),
      publicado: values.publicado,
      duracion_total_min: values.duracion_total_min,
      max_estudiantes: values.max_estudiantes,
    }
    createCourse(payload as any, {
      onSuccess: () => {
        toast.success('Curso creado como borrador. Para activarlo, ve a Editar, marca "Publicado" y confirma minutos y máximo de estudiantes.')
        setCreateOpen(false)
      },
      onError: (err) => toast.error(getApiErrorMessage(err, 'Error al crear')),
    })
  }

  const handleUpdate = async (values: FormValues) => {
    if (!editCourse) return

    let finalDocenteId = values.docenteId
    if (typeof finalDocenteId === 'string' && finalDocenteId !== '') {
      try {
        const newTeacher = await teacherService.create({ usuarioId: finalDocenteId, especialidad: 'Designado Auto', anios_experiencia: 0 })
        finalDocenteId = newTeacher.id
      } catch (err) {
        toast.error('Error auto-registrando la cuenta de Docente en base de datos. Completa en Menú de Profesores.')
        return
      }
    }

    updateCourse(
      { id: editCourse.id, data: { id: editCourse.id, ...values, docenteId: Number(finalDocenteId) } as any },
      {
        onSuccess: () => {
          toast.success('Curso actualizado')
          setEditCourse(null)
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'Error al actualizar')),
      },
    )
  }

  const handleDelete = (id: number) => {
    deleteCourse(id, {
      onSuccess: () => toast.success('Curso desactivado correctamente'),
      onError: (err) => toast.error(getApiErrorMessage(err, 'Error al desactivar el curso')),
    })
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cursos</h1>
            <p className="text-sm text-muted-foreground">
              {filteredCourses.length} registros
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar curso..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 w-60"
            />
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Nuevo Curso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuevo Curso</DialogTitle>
                <DialogDescription>
                  Completa la información del curso
                </DialogDescription>
              </DialogHeader>

              <CourseForm
                defaultValues={{}}
                onSubmit={handleCreate}
                isPending={isCreating}
                onCancel={() => setCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editCourse} onOpenChange={(o) => !o && setEditCourse(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
            <DialogDescription>
              Modifica los datos del curso
            </DialogDescription>
          </DialogHeader>

          {editCourse && (
            <CourseForm
              defaultValues={{
                titulo: editCourse.titulo,
                descripcion: editCourse.descripcion || '',
                nivel: editCourse.nivel,
                imagen_url: editCourse.imagen_url || '',
                docenteId: editCourse.docenteId ?? undefined,
                publicado: editCourse.publicado,
                duracion_total_min: editCourse.duracion_total_min,
                max_estudiantes: editCourse.max_estudiantes ?? undefined,
              }}
              onSubmit={handleUpdate}
              isPending={isUpdating}
              onCancel={() => setEditCourse(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de cursos</CardTitle>
          <CardDescription>Administra los cursos del sistema</CardDescription>
        </CardHeader>

        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <ServerCrash />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No se pudieron cargar los cursos
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      No hay cursos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map(course => (
                    <TableRow key={course.id}>
                      <TableCell>{course.titulo}</TableCell>
                      <TableCell>{course.nivel}</TableCell>
                      <TableCell>{course.duracion_total_min} min</TableCell>
                      <TableCell>
                        <Badge variant={course.publicado ? 'default' : 'secondary'}>
                          {course.publicado ? 'Publicado' : 'Borrador'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditCourse(course)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <ConfirmDeleteButton onConfirm={() => handleDelete(course.id)} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

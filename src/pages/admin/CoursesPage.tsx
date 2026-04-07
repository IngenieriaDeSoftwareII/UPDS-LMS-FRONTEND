import { useState, useMemo, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Pencil, BookOpen, ServerCrash, Search, GraduationCap, Clock, Users } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const NIVELES = ['Básico', 'Intermedio', 'Avanzado'] as const
const DEFAULT_COURSE_IMAGE_URL = 'https://www.ucentral.edu.co/sites/default/files/imagenes-ucentral/Noticentral/2021-04/04-19-21-tecnicas-de-estudio-03.webp'

const courseSchema = z.object({
  titulo: z.string().min(1, 'Requerido').max(200),
  descripcion: z.string().optional(),
  nivel: z.enum(NIVELES, { message: 'Requerido' }),
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
  isEditMode = false,
}: {
  defaultValues: Partial<FormValues>
  onSubmit: (values: FormValues) => void
  isPending: boolean
  onCancel: () => void
  isEditMode?: boolean
}) {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: {
      titulo: '',
      descripcion: '',
      nivel: 'Básico',
      imagen_url: DEFAULT_COURSE_IMAGE_URL,
      docenteId: undefined,
      publicado: false,
      duracion_total_min: 60,
      max_estudiantes: undefined,
      ...defaultValues,
    },
  })

  // Resetear el formulario cuando cambian los defaultValues
  useEffect(() => {
    console.log('🔄 Datos recibidos para resetear:', defaultValues)
    reset({
      titulo: defaultValues.titulo ?? '',
      descripcion: defaultValues.descripcion ?? '',
      nivel: (defaultValues.nivel as 'Básico' | 'Intermedio' | 'Avanzado') ?? 'Básico',
      imagen_url: defaultValues.imagen_url ?? DEFAULT_COURSE_IMAGE_URL,
      docenteId: defaultValues.docenteId,
      publicado: defaultValues.publicado ?? false,
      duracion_total_min: defaultValues.duracion_total_min ?? 60,
      max_estudiantes: defaultValues.max_estudiantes,
    })
  }, [defaultValues, reset])

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
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nivel..." />
                  </SelectTrigger>
                  <SelectContent>
                    {NIVELES.map((nivel) => (
                      <SelectItem key={nivel} value={nivel}>
                        {nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <>
              {isEditMode && (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Imagen URL (No editable)</FieldLabel>
                  <Input {...field} readOnly className="bg-muted cursor-not-allowed" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            </>
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
  const [searchTerm, setSearchTerm] = useState('')

  const { data: courses, isLoading, isError, error, refetch } = useCourses()

  const { mutate: createCourse, isPending: isCreating } = useCreateCourse()
  const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse()
  const { mutate: deleteCourse } = useDeleteCourse()

  const filteredCourses = useMemo(() => {
    if (!courses) return []
    const q = searchTerm.toLowerCase()
    if (!q) return courses
    return courses.filter(c => c.titulo.toLowerCase().includes(q))
  }, [courses, searchTerm])

  // Estadísticas
  const totalCourses = courses?.length ?? 0
  const publishedCourses = courses?.filter(c => c.publicado).length ?? 0
  const totalDuration = courses?.reduce((acc, c) => acc + (c.duracion_total_min || 0), 0) ?? 0
  const avgDuration = totalCourses > 0 ? Math.round(totalDuration / totalCourses) : 0

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
      imagenUrl: DEFAULT_COURSE_IMAGE_URL,
      docenteId: Number(finalDocenteId),
      publicado: values.publicado,
      duracionTotalMin: Number(values.duracion_total_min || 0),
      maxEstudiantes: values.max_estudiantes ? Number(values.max_estudiantes) : null,
    }
    console.log('📤 Payload enviado (CREATE):', payload)
    createCourse(payload as any, {
      onSuccess: () => {
        toast.success('Curso creado. Abre Editar para confirmar que todos los campos se guardaron.')
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

    // Construir payload con ID (obligatorio para UPDATE)
    const updateData: any = {
      id: editCourse.id,  // ✅ OBLIGATORIO: Backend requiere el ID en el body
      titulo: values.titulo,
      descripcion: values.descripcion ?? '',  // Enviar string vacío en lugar de null
      nivel: values.nivel,
      imagenUrl: editCourse.imagen_url || DEFAULT_COURSE_IMAGE_URL,
      docenteId: Number(finalDocenteId),
      publicado: values.publicado,
      duracionTotalMin: Number(values.duracion_total_min || 0),
    }

    // Solo incluir maxEstudiantes si tiene valor válido
    if (values.max_estudiantes && values.max_estudiantes > 0) {
      updateData.maxEstudiantes = Number(values.max_estudiantes)
    }

    // Solo incluir categoriaId si existe
    if (editCourse.categoriaId) {
      updateData.categoriaId = editCourse.categoriaId
    }

    console.log('📤 Payload COMPLETO (UPDATE):', JSON.stringify(updateData, null, 2))
    updateCourse(
      {
        id: editCourse.id,
        data: updateData,
      },
      {
        onSuccess: () => {
          toast.success('Curso actualizado correctamente')
          setEditCourse(null)
        },
        onError: (err) => {
          console.error('❌ Error en UPDATE:', err)
          toast.error(getApiErrorMessage(err, 'Error al actualizar'))
        },
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

      {/* Header - Mismo estilo que CategoriesPage */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary shadow-inner">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Administración</p>
            <h1 className="text-2xl font-bold">Cursos académicos</h1>
            <p className="text-sm text-muted-foreground">
              Gestión de cursos, niveles y asignación docente desde una vista central.
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por título..."
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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
                isEditMode={false}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tarjetas de estadísticas - Mismo estilo que CategoriesPage */}
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
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {courses?.reduce((acc, c) => acc + (c.max_estudiantes || 0), 0) ?? 0}
            </p>
          </div>
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
                nivel: (editCourse.nivel as 'Básico' | 'Intermedio' | 'Avanzado') || 'Básico',
                imagen_url: editCourse.imagen_url || DEFAULT_COURSE_IMAGE_URL,
                docenteId: editCourse.docenteId ?? undefined,
                publicado: editCourse.publicado,
                duracion_total_min: editCourse.duracion_total_min,
                max_estudiantes: editCourse.max_estudiantes ?? undefined,
              }}
              onSubmit={handleUpdate}
              isPending={isUpdating}
              onCancel={() => setEditCourse(null)}
              isEditMode={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Tabla - Mismo estilo que CategoriesPage */}
      <Card className="border border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="border-b border-border bg-muted/40">
          <CardTitle className="text-lg">Cursos registrados</CardTitle>
          <CardDescription>
            {filteredCourses.length} resultado(s) sobre {totalCourses} cursos y {publishedCourses} publicados.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6">
              <Alert variant="destructive">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Error al cargar registros</AlertTitle>
                <AlertDescription className="flex flex-wrap items-center gap-2">
                  {getApiErrorMessage(error, 'Error al cargar cursos')}
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
          ) : filteredCourses.length === 0 ? (
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
                  {filteredCourses.map(course => (
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditCourse(course)}
                            title="Editar curso"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <ConfirmDeleteButton onConfirm={() => handleDelete(course.id)} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
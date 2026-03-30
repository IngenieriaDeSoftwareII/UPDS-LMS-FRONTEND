import { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Pencil, BookOpen, Search, Trash2, CheckCircle2, Sparkles, Gauge, Users, Clock4, ImageOff } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api.error'

import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourse, usePublishCourse } from '@/hooks/useCourses'
import { useCategories } from '@/hooks/useCategories'
import { useTeachers } from '@/hooks/useTeachers'
import type { CourseDto } from '@/types/course'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'

const courseSchema = z.object({
  title: z.string().min(1, 'Requerido').max(150),
  description: z.string().min(1, 'Requerido').max(1000),
  teacherId: z.string().min(1, 'Requerido'),
  level: z.string().min(1, 'Requerido'),
  categoryId: z.string().min(1, 'Requerido'),
  imageUrl: z.string().optional(),
  isPublished: z.boolean().default(false),
  maxStudents: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
})
type FormValues = z.infer<typeof courseSchema>

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5024/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

const resolveImageUrl = (image?: string) => {
  if (!image) return ''
  if (/^https?:\/\//i.test(image)) return image
  return `${API_ORIGIN}${image.startsWith('/') ? '' : '/'}${image}`
}

const buildCoursePayload = (course: CourseDto | any, published: boolean) => {
  const courseId = String(course.id)
  const title = course.title ?? course.titulo
  const description = course.description ?? course.descripcion
  const teacherId = course.teacherId ?? course.teacher_id ?? course.docenteId ?? course.teacherId
  const level = course.level ?? course.nivel
  const categoryId = course.categoryId ?? course.categoriaId ?? course.category_id
  const totalDurationMin = course.totalDurationMin ?? course.totalDurationMinutes ?? course.duracion_total_min
  const maxStudents = course.maxStudents ?? course.max_estudiantes ?? 0
  const imageUrl = course.imageUrl ?? course.imagen_url ?? undefined

  return {
    courseId,
    title,
    description,
    teacherId,
    level,
    categoryId,
    totalDurationMin,
    maxStudents,
    imageUrl,
    payload: {
      id: courseId,
      title,
      description,
      teacherId: teacherId ? String(teacherId) : '',
      level: level || '',
      categoryId: categoryId ? String(categoryId) : '',
      imageUrl,
      isPublished: published,
      totalDurationMin: Number(totalDurationMin ?? 0),
      maxStudents: Number(maxStudents ?? 0),
    },
  }
}

function CourseForm({ defaultValues, onSubmit, isPending, onCancel }: { defaultValues: Partial<FormValues>, onSubmit: (v: FormValues) => void, isPending: boolean, onCancel: () => void }) {
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories()
  const { data: teachers = [], isLoading: isLoadingTeachers } = useTeachers()

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: { title: '', description: '', teacherId: '', level: '', categoryId: '', imageUrl: '', isPublished: false, maxStudents: 0, ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      <FieldGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller name="title" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="title">Título</FieldLabel>
              <Input id="title" placeholder="Ej. React desde cero" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />
          <Controller name="level" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Nivel</FieldLabel>
              <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                <SelectTrigger><SelectValue placeholder="Seleccione nivel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Básico">Básico</SelectItem>
                  <SelectItem value="Intermedio">Intermedio</SelectItem>
                  <SelectItem value="Avanzado">Avanzado</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />
        </div>

        <Controller name="description" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="description">Descripción</FieldLabel>
            <Input id="description" placeholder="Aprende paso a paso..." {...field} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller name="categoryId" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Categoría</FieldLabel>
              <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined} disabled={isLoadingCategories}>
                <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />

          <Controller name="teacherId" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Docente</FieldLabel>
              <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined} disabled={isLoadingTeachers}>
                <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t: any) => <SelectItem key={t.id} value={String(t.id)}>{t.fullName || t.userFullName || t.userName || t.userId}</SelectItem>)}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller name="maxStudents" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="maxStudents">Max. Estudiantes</FieldLabel>
              <Input id="maxStudents" type="number" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />
        </div>

        <Controller name="imageUrl" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="imageUrl">URL Imagen (Opcional)</FieldLabel>
            <Input id="imageUrl" placeholder="https://..." {...field} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />

        <Controller name="isPublished" control={control} render={({ field }) => (
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="isPublished" checked={field.value} onCheckedChange={field.onChange} />
            <label htmlFor="isPublished" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Curso publicado
            </label>
          </div>
        )} />
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar'}</Button>
      </DialogFooter>
    </form>
  )
}

export function CoursesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editCourse, setEditCourse] = useState<CourseDto | null>(null)
  const [search, setSearch] = useState('')
  const [activatingId, setActivatingId] = useState<string | null>(null)
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})

  const { data: courses, isLoading, error } = useCourses()
  const { data: categories = [] } = useCategories()
  const { data: teachers = [] } = useTeachers()

  const categoryMap = useMemo(() => Object.fromEntries(categories.map((c) => [String(c.id), c.name])), [categories])
  const teacherMap = useMemo(() => Object.fromEntries(teachers.map((t: any) => [String(t.id), t.fullName || t.userFullName || t.userName || t.userId])), [teachers])

  const filteredCourses = useMemo(() => {
    if (!courses) return []
    const q = search.trim().toLowerCase()
    if (!q) return courses
    return courses.filter((c: any) => {
      const title = (c.title || c.titulo || '').toLowerCase()
      const desc = (c.description || c.descripcion || '').toLowerCase()
      return title.includes(q) || desc.includes(q)
    })
  }, [courses, search])

  const { mutate: createCourse, isPending: isCreating } = useCreateCourse()
  const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse()
  const { mutate: publishCourse, isPending: isPublishing } = usePublishCourse()
  const { mutate: deleteCourse } = useDeleteCourse()

  const handleCreate = (values: FormValues) => {
    createCourse({ ...values, totalDurationMin: 0 }, {
      onSuccess: () => { setCreateOpen(false); toast.success('Curso registrado exitosamente') },
      onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo registrar')),
    })
  }

  const handleUpdate = (values: FormValues) => {
    if (!editCourse) return
    const duration = editCourse.totalDurationMin ?? (editCourse as any).totalDurationMinutes ?? (editCourse as any).duracion_total_min ?? 0
    updateCourse({ id: editCourse.id, data: { ...values, id: editCourse.id, totalDurationMin: Number(duration) } }, {
      onSuccess: () => { setEditCourse(null); toast.success('Curso actualizado correctamente') },
      onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo actualizar')),
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este curso?')) return
    deleteCourse(id, {
      onSuccess: () => toast.success('Curso eliminado correctamente'),
      onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo eliminar')),
    })
  }

  const handleTogglePublish = (course: CourseDto, publish: boolean) => {
    if (activatingId) return
    const { courseId, payload } = buildCoursePayload(course, publish)

    if (!payload.title || !payload.description || !payload.teacherId || !payload.level || !payload.categoryId) {
      toast.error('Datos incompletos. Completa título, descripción, docente, nivel y categoría.')
      return
    }

    setActivatingId(courseId)
    publishCourse({ id: courseId, data: payload }, {
      onSuccess: () => toast.success(publish ? 'Curso activado y visible en catálogo' : 'Curso desactivado'),
      onError: (err) => toast.error(getApiErrorMessage(err, publish ? 'No se pudo activar el curso' : 'No se pudo desactivar el curso')),
      onSettled: () => setActivatingId(null),
    })
  }

  return (
    <div className="space-y-6 rounded-2xl border bg-background/80 p-6 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl border border-primary/20 bg-primary/10 shadow-inner text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">Catálogo</p>
            <h1 className="text-2xl font-bold">Cursos</h1>
            <p className="text-sm text-muted-foreground">{filteredCourses.length} {search ? 'resultado(s)' : 'registros'} • {courses?.length ?? 0} totales</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar curso o descripción..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20"><PlusCircle className="w-4 h-4" /> Nuevo Curso</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px] border border-border bg-card">
              <DialogHeader><DialogTitle>Nuevo Curso</DialogTitle></DialogHeader>
              <CourseForm defaultValues={{}} onSubmit={handleCreate} isPending={isCreating} onCancel={() => setCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card/70 px-4 py-3 shadow-inner">
          <Gauge className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
          <div>
            <p className="text-xs uppercase text-muted-foreground">Publicados</p>
            <p className="text-lg font-semibold">{courses?.filter((c: any) => c.isPublished ?? c.publicado).length ?? 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card/70 px-4 py-3 shadow-inner">
          <Clock4 className="w-5 h-5 text-amber-600 dark:text-amber-300" />
          <div>
            <p className="text-xs uppercase text-muted-foreground">Borradores</p>
            <p className="text-lg font-semibold">{courses?.filter((c: any) => !(c.isPublished ?? c.publicado)).length ?? 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card/70 px-4 py-3 shadow-inner">
          <Users className="w-5 h-5 text-sky-600 dark:text-sky-300" />
          <div>
            <p className="text-xs uppercase text-muted-foreground">Docentes asignados</p>
            <p className="text-lg font-semibold">{teachers.length}</p>
          </div>
        </div>
      </div>

      <Dialog open={!!editCourse} onOpenChange={(open) => !open && setEditCourse(null)}>
        <DialogContent className="sm:max-w-[640px] border border-border bg-card">
          <DialogHeader><DialogTitle>Editar Curso</DialogTitle></DialogHeader>
          {editCourse && <CourseForm defaultValues={{
            title: editCourse.title || (editCourse as any).titulo,
            description: editCourse.description || (editCourse as any).descripcion,
            teacherId: editCourse.teacherId ? String(editCourse.teacherId) : '',
            level: editCourse.level || (editCourse as any).nivel,
            categoryId: editCourse.categoryId ? String(editCourse.categoryId) : '',
            imageUrl: editCourse.imageUrl || (editCourse as any).imagen_url,
            isPublished: editCourse.isPublished ?? (editCourse as any).publicado,
            maxStudents: editCourse.maxStudents ?? (editCourse as any).max_estudiantes ?? 0,
          }} onSubmit={handleUpdate} isPending={isUpdating} onCancel={() => setEditCourse(null)} />}
        </DialogContent>
      </Dialog>

      <Card className="border border-border bg-card">
        <CardHeader className="pb-3 border-b border-border bg-muted/40 backdrop-blur rounded-t-xl">
          <CardTitle className="text-base font-semibold">Catálogo visual</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
                  <Skeleton className="h-36 w-full" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-red-400">Error al cargar datos.</p>
          ) : filteredCourses.length === 0 ? (
            <p className="text-center text-slate-400">Cero resultados.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course: any) => {
                const title = course.title || course.titulo || 'Curso sin título'
                const desc = course.description || course.descripcion || 'Sin descripción'
                const level = course.level || course.nivel || '—'
                const slots = course.maxStudents ?? course.max_estudiantes ?? '—'
                const published = course.isPublished ?? course.publicado
                const category = categoryMap[String(course.categoryId)] || categoryMap[String((course as any).categoryId)] || 'Sin categoría'
                const teacher = teacherMap[String(course.teacherId)] || teacherMap[String((course as any).teacherId)] || 'Sin docente'
                const image = resolveImageUrl(course.imageUrl || (course as any).imagen_url || '')
                const showImage = image && !brokenImages[course.id]

                return (
                  <div key={course.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card/70 shadow-xl shadow-black/5 dark:shadow-black/40">
                    <div className="h-40 w-full overflow-hidden bg-gradient-to-br from-muted to-muted/80">
                      {showImage ? (
                        <img
                          src={image}
                          alt={title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={() => setBrokenImages((prev) => ({ ...prev, [course.id]: true }))}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm gap-2">
                          <ImageOff className="w-5 h-5" /> Sin imagen
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">{category}</p>
                          <h3 className="text-lg font-semibold leading-tight">{title}</h3>
                          <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ published ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 border border-emerald-500/30' : 'bg-muted text-muted-foreground border border-border' }`}>
                          {published ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-foreground">
                        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
                          <p className="text-[11px] uppercase text-muted-foreground">Nivel</p>
                          <p className="font-medium">{level}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
                          <p className="text-[11px] uppercase text-muted-foreground">Cupos</p>
                          <p className="font-medium">{slots}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
                          <p className="text-[11px] uppercase text-muted-foreground">Docente</p>
                          <p className="font-medium">{teacher}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 gap-2">
                        <div className="text-xs text-muted-foreground">ID: {course.id}</div>
                        <div className="flex items-center gap-2">
                          {published ? (
                            <Button variant="secondary" size="sm" className="border border-amber-300/60 bg-amber-500/15 text-amber-700 dark:text-amber-100 hover:bg-amber-500/25" onClick={() => handleTogglePublish(course, false)} disabled={isPublishing && activatingId === course.id}>
                              {isPublishing && activatingId === course.id ? 'Desactivando...' : <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Desactivar</span>}
                            </Button>
                          ) : (
                            <Button variant="secondary" size="sm" className="border border-emerald-300/60 bg-emerald-500/15 text-emerald-700 dark:text-emerald-100 hover:bg-emerald-500/25" onClick={() => handleTogglePublish(course, true)} disabled={isPublishing && activatingId === course.id}>
                              {isPublishing && activatingId === course.id ? 'Activando...' : <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Activar</span>}
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted" onClick={() => setEditCourse(course)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(course.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
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
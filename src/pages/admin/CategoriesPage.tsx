import React, { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BookOpenText, Pencil, PlusCircle, Search, ServerCrash, Link2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api.error'

import { useCategories, useCategoryById, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories'
import { useCourses, useUpdateCourse } from '@/hooks/useCourses'
import type { Category } from '@/types/category'

import { Button } from '@/components/ui/button'
import { ConfirmDeleteButton } from '@/components/common/ConfirmDeleteButton'
import { Badge } from '@/components/ui/badge'
import { MultiSelect } from '@/components/ui/multi-select'
import { Input } from '@/components/ui/input'
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

const DEFAULT_COURSE_IMAGE_URL = 'https://www.ucentral.edu.co/sites/default/files/imagenes-ucentral/Noticentral/2021-04/04-19-21-tecnicas-de-estudio-03.webp'

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 100)
}

const categorySchema = z.object({
  nombre: z.string().min(1, 'Requerido').max(100),
  descripcion: z.string().optional(),
  cursoIds: z.array(z.number()).optional(),
})

const categoryEditSchema = z.object({
  nombre: z.string().min(1, 'Requerido').max(100),
  descripcion: z.string().optional(),
})

type FormValues = z.infer<typeof categorySchema>
type EditFormValues = z.infer<typeof categoryEditSchema>

function CategoryForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues: Partial<FormValues>
  onSubmit: (values: FormValues) => void
  isPending: boolean
}) {
  const { data: courses = [] } = useCourses()
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  })

  React.useEffect(() => {
    const valuesToReset = {
      ...defaultValues,
      cursoIds: Array.isArray(defaultValues?.cursoIds) ? defaultValues.cursoIds : [],
    }
    reset(valuesToReset)
  }, [defaultValues, reset])

  const courseOptions = React.useMemo(() => {
    return courses.map(c => ({
      label: c.titulo,
      value: String(c.id),
    }))
  }, [courses])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="nombre"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Nombre de la categoría</FieldLabel>
            <Input {...field} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

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

      <Controller
        name="cursoIds"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Cursos (opcional)</FieldLabel>
            <MultiSelect
              options={courseOptions}
              selected={field.value ? field.value.map(String) : []}
              onChange={val => field.onChange(val.map(Number))}
              placeholder="Seleccionar curso..."
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

function CategoryEditForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues: Partial<EditFormValues>
  onSubmit: (values: EditFormValues) => void
  isPending: boolean
}) {
  const { control, handleSubmit, reset } = useForm<EditFormValues>({
    resolver: zodResolver(categoryEditSchema),
    defaultValues,
  })

  React.useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="nombre"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Nombre de la categoría</FieldLabel>
            <Input {...field} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

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

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

function CreateCategoryDialog() {
  const { mutate, isPending: isSavingCategory } = useCreateCategory()
  const { mutateAsync: updateCourse } = useUpdateCourse()
  const { data: allCourses, refetch: refetchCourses } = useCourses()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const isPending = isSavingCategory || isLinking

  const handleSubmit = (values: FormValues) => {
    mutate(values, {
      onSuccess: async newCategory => {
        setIsLinking(true)
        try {
          const selectedCourseIds = values.cursoIds || []
          
          if (selectedCourseIds.length > 0 && allCourses) {
            const promises = selectedCourseIds.map(id => {
              const course = allCourses.find(x => x.id === id)
              if (course) {
                return updateCourse({
                  id,
                  data: {
                    id: course.id,
                    titulo: course.titulo,
                    descripcion: course.descripcion,
                    nivel: course.nivel,
                    imagenUrl: DEFAULT_COURSE_IMAGE_URL,
                    docenteId: course.docenteId,
                    categoriaId: newCategory.id,
                    publicado: course.publicado,
                    duracionTotalMin: course.duracion_total_min,
                    maxEstudiantes: course.max_estudiantes,
                  } as any,
                })
              }
              return Promise.resolve()
            })
            
            await Promise.all(promises)
          }
          
          toast.success('Categoría creada exitosamente')
          
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['categories'] }),
            refetchCourses(),
          ])
          
          setOpen(false)
        } catch (error) {
          console.error('Error linking courses:', error)
          toast.error('Creada, pero hubo un error al vincular cursos')
        } finally {
          setIsLinking(false)
        }
      },
      onError: err => {
        console.error('Error creating category:', err)
        toast.error(getApiErrorMessage(err, 'Error al crear la categoría'))
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Nueva categoría
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir nueva categoría</DialogTitle>
          <DialogDescription>Ingresa la información básica de la categoría.</DialogDescription>
        </DialogHeader>
        <CategoryForm
          defaultValues={{ nombre: '', descripcion: '' }}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

function EditCategoryDialog({ category }: { category: Category }) {
  const { mutate, isPending } = useUpdateCategory()
  const [open, setOpen] = useState(false)
  const { data: categoryDetail, isLoading } = useCategoryById(open ? category.id : 0)

  const handleSubmit = (values: EditFormValues) => {
    const slug = (categoryDetail as any)?.slug || generateSlug(values.nombre)
    const catalogoId = (categoryDetail as any)?.catalogoId || null

    mutate(
      {
        id: category.id,
        data: {
          id: category.id,
          nombre: values.nombre,
          slug,
          descripcion: values.descripcion,
          catalogoId,
        } as any,
      },
      {
        onSuccess: () => {
          toast.success('Categoría actualizada exitosamente')
          setOpen(false)
        },
        onError: err => toast.error(getApiErrorMessage(err, 'Error al actualizar')),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-1" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar categoría</DialogTitle>
          <DialogDescription>Modifica los datos de la categoría.</DialogDescription>
        </DialogHeader>
        {!categoryDetail || isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <CategoryEditForm
            defaultValues={{
              nombre: categoryDetail.nombre ?? category.nombre,
              descripcion: categoryDetail.descripcion ?? category.descripcion ?? '',
            }}
            onSubmit={handleSubmit}
            isPending={isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function DeleteCategoryButton({ categoryId }: { categoryId: number }) {
  const { mutate } = useDeleteCategory()
  return (
    <ConfirmDeleteButton
      onConfirm={() =>
        mutate(categoryId, {
          onSuccess: () => toast.success('Categoría desactivada'),
          onError: err => toast.error(getApiErrorMessage(err, 'Error al desactivar categoría')),
        })
      }
    />
  )
}

function ManageCategoryCoursesDialog({ category }: { category: Category }) {
  const { mutateAsync: updateCourse } = useUpdateCourse()
  const { data: allCourses } = useCourses()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [localSelectedIds, setLocalSelectedIds] = useState<number[]>([])
  const { data: categoryDetail, isLoading } = useCategoryById(open ? category.id : 0)

  React.useEffect(() => {
    if (categoryDetail) {
      let ids: number[] = []
      if (Array.isArray(categoryDetail.cursoIds) && categoryDetail.cursoIds.length > 0) {
        ids = categoryDetail.cursoIds
      } else if (Array.isArray(categoryDetail.cursos) && categoryDetail.cursos.length > 0) {
        ids = categoryDetail.cursos.map(c => c.id)
      } else if (Array.isArray((categoryDetail as any).Cursos) && (categoryDetail as any).Cursos.length > 0) {
        ids = (categoryDetail as any).Cursos.map(c => c.id)
      }
      setLocalSelectedIds(ids)
    }
  }, [categoryDetail])

  const courseOptions = React.useMemo(() => {
    return (allCourses || []).map(c => ({
      label: c.titulo,
      value: String(c.id),
    }))
  }, [allCourses])

  const handleSaveCourses = async () => {
    setIsUpdating(true)
    try {
      let originalIds: number[] = []
      if (categoryDetail?.cursoIds && Array.isArray(categoryDetail.cursoIds)) {
        originalIds = categoryDetail.cursoIds
      } else if (categoryDetail?.cursos && Array.isArray(categoryDetail.cursos)) {
        originalIds = categoryDetail.cursos.map(c => c.id)
      } else if ((categoryDetail as any)?.Cursos && Array.isArray((categoryDetail as any).Cursos)) {
        originalIds = (categoryDetail as any).Cursos.map(c => c.id)
      }

      const toUnlink = originalIds.filter(id => !localSelectedIds.includes(id))
      const toLink = localSelectedIds.filter(id => !originalIds.includes(id))

      if (!allCourses) {
        toast.error('No hay cursos disponibles')
        return
      }

      const promises = []

      for (const courseId of toLink) {
        const course = allCourses.find(x => x.id === courseId)
        if (course) {
          promises.push(
            updateCourse({
              id: course.id,
              data: {
                id: course.id,
                titulo: course.titulo,
                descripcion: course.descripcion,
                nivel: course.nivel,
                imagenUrl: DEFAULT_COURSE_IMAGE_URL,
                docenteId: course.docenteId,
                categoriaId: category.id,
                publicado: course.publicado,
                duracionTotalMin: course.duracion_total_min,
                maxEstudiantes: course.max_estudiantes,
              } as any,
            }),
          )
        }
      }

      for (const courseId of toUnlink) {
        const course = allCourses.find(x => x.id === courseId)
        if (course) {
          promises.push(
            updateCourse({
              id: course.id,
              data: {
                id: course.id,
                titulo: course.titulo,
                descripcion: course.descripcion,
                nivel: course.nivel,
                imagenUrl: DEFAULT_COURSE_IMAGE_URL,
                docenteId: course.docenteId,
                categoriaId: null,
                publicado: course.publicado,
                duracionTotalMin: course.duracion_total_min,
                maxEstudiantes: course.max_estudiantes,
              } as any,
            }),
          )
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises)
      }

      toast.success('Cursos guardados exitosamente')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories', category.id] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      setOpen(false)
    } catch (error) {
      console.error('Error guardando cursos:', error)
      toast.error('Hubo un error al guardar los cursos')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCoursesChange = (newCourseIds: number[]) => {
    setLocalSelectedIds(newCourseIds)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="h-4 w-4 mr-1" /> Cursos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestionar cursos</DialogTitle>
          <DialogDescription>Agrega o quita cursos para la categoría "{category.nombre}".</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-2 py-4">
            <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <MultiSelect
                options={courseOptions}
                selected={localSelectedIds.map(String)}
                onChange={val => {
                  const newIds = val.map(Number)
                  handleCoursesChange(newIds)
                }}
                placeholder="Seleccionar cursos..."
                disabled={isUpdating}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveCourses}
                disabled={isUpdating}
              >
                {isUpdating ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function CategoryCoursesPreview({ courseNames }: { courseNames: string[] }) {
  if (courseNames.length === 0) {
    return <span className="text-sm text-muted-foreground">Sin cursos asociados</span>
  }

  const visible = courseNames.slice(0, 3)
  const remaining = courseNames.length - visible.length

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map(name => (
        <Badge
          key={name}
          variant="secondary"
          className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {name}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className="text-slate-600 dark:text-slate-300">
          +{remaining} más
        </Badge>
      )}
    </div>
  )
}

export function CategoriesPage() {
  const { data: categories, isLoading, isError, error, refetch } = useCategories()
  const { data: courses = [] } = useCourses()
  const [searchTerm, setSearchTerm] = useState('')

  const coursesByCategory = useMemo(() => {
    const map = new Map<number, string[]>()
    courses.forEach(course => {
      if (!course.categoriaId) return
      const existing = map.get(course.categoriaId) ?? []
      existing.push(course.titulo)
      map.set(course.categoriaId, existing)
    })
    return map
  }, [courses])

  const filtered = useMemo(() => {
    if (!categories) return []
    if (!searchTerm) return categories
    const term = searchTerm.toLowerCase()
    return categories.filter(
      c => c.nombre.toLowerCase().includes(term) || (c.descripcion ?? '').toLowerCase().includes(term),
    )
  }, [categories, searchTerm])

  const totalCategories = categories?.length ?? 0
  const totalCoursesLinked = useMemo(() => {
    return (categories ?? []).reduce((acc, category) => acc + (coursesByCategory.get(category.id)?.length ?? 0), 0)
  }, [categories, coursesByCategory])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary shadow-inner">
            <BookOpenText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Administración</p>
            <h1 className="text-2xl font-bold">Categorías académicas</h1>
            <p className="text-sm text-muted-foreground">
              Gestión de categorías y la vinculación con cursos desde una vista central.
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre o descripción"
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <CreateCategoryDialog />
        </div>
      </div>

      <Card className="border border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="border-b border-border bg-muted/40">
          <CardTitle className="text-lg">Categorías registradas</CardTitle>
          <CardDescription>
            {filtered.length} resultado(s) sobre {totalCategories} categorías y {totalCoursesLinked} cursos vinculados.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6">
              <Alert variant="destructive">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Error al cargar registros</AlertTitle>
                <AlertDescription className="flex flex-wrap items-center gap-2">
                  {getApiErrorMessage(error, 'Error al cargar categorías')}
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
          ) : filtered.length === 0 ? (
            <div className="p-6">
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>Sin resultados</CardTitle>
                  <CardDescription>No se encontraron categorías con ese criterio de búsqueda.</CardDescription>
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
                    <TableHead className="min-w-48">Categoría</TableHead>
                    <TableHead className="min-w-64">Descripción</TableHead>
                    <TableHead>Cursos asociados</TableHead>
                    <TableHead className="w-48 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(category => {
                    const courseNames = coursesByCategory.get(category.id) ?? []

                    return (
                      <TableRow key={category.id}>
                        <TableCell>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{category.nombre}</p>
                        </TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">
                          {category.descripcion?.trim() ? category.descripcion : 'Sin descripción'}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <CategoryCoursesPreview courseNames={courseNames} />
                            <span className="text-xs text-muted-foreground">{courseNames.length} curso(s) vinculados</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <EditCategoryDialog category={category} />
                            <ManageCategoryCoursesDialog category={category} />
                            <DeleteCategoryButton categoryId={category.id} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
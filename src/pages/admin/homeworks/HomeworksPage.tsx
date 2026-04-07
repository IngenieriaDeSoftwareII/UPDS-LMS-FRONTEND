import { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Pencil, FileText, ServerCrash, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api.error'

import { useHomeWork } from '@/hooks/useHomeWork'
import { useLessons } from '@/hooks/useLessons'
import type { getHomeWorkDto } from '@/types/homeWork'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

const documentFormats = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rar', 'zip', 'otro'] as const

const homeworkSchema = z.object({
  lessonId: z.coerce.number().min(1, 'Requerido'),
  titulo: z.string().min(1, 'Requerido').max(200),
  descripcion: z.string().min(1, 'Requerido'),
  fechaApertura: z.string().min(1, 'Requerido'),
  fechaEntrega: z.string().min(1, 'Requerido'),
  fechaLimite: z.string().min(1, 'Requerido'),
  urlArchivo: z.string().optional(),
  formato: z.enum(documentFormats),
  tamanoKb: z.coerce.number().min(0).optional(),
  file: z.any().optional(),
})

type FormValues = z.infer<typeof homeworkSchema>

function HomeworkForm({
  defaultValues,
  onSubmit,
  isPending,
  onCancel,
  lessons,
}: {
  defaultValues: Partial<FormValues>
  onSubmit: (values: FormValues) => void
  isPending: boolean
  onCancel: () => void
  lessons: any[]
}) {
  const { control, handleSubmit, register, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(homeworkSchema) as any,
    defaultValues: {
      lessonId: 0,
      titulo: '',
      descripcion: '',
      fechaApertura: new Date().toISOString().slice(0, 16),
      fechaEntrega: new Date().toISOString().slice(0, 16),
      fechaLimite: new Date().toISOString().slice(0, 16),
      urlArchivo: '',
      formato: 'pdf',
      tamanoKb: 0,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>

        <Controller
          name="lessonId"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Lección</FieldLabel>
              <Select value={field.value?.toString() || ''} onValueChange={(val) => field.onChange(Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una lección..." />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map(lesson => (
                    <SelectItem key={lesson.id} value={lesson.id.toString()}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

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

        <div className="grid grid-cols-3 gap-4">
          <Controller
            name="fechaApertura"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Apertura</FieldLabel>
                <Input type="datetime-local" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="fechaEntrega"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Entrega</FieldLabel>
                <Input type="datetime-local" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="fechaLimite"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Límite</FieldLabel>
                <Input type="datetime-local" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="formato"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Formato</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Formato..." />
                  </SelectTrigger>
                  <SelectContent>
                    {documentFormats.map(f => (
                      <SelectItem key={f} value={f}>{f.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Field data-invalid={!!errors.file}>
            <FieldLabel>Archivo Adjunto</FieldLabel>
            <Input type="file" {...register('file')} />
            {errors.file && <FieldError errors={[errors.file]} />}
          </Field>
        </div>

        <Controller
          name="urlArchivo"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>URL Alternativa (Opcional si no se sube un archivo local)</FieldLabel>
              <Input {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
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

export function HomeworksPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editHomework, setEditHomework] = useState<getHomeWorkDto | null>(null)
  const [search, setSearch] = useState('')

  const { getAll, create, update, remove } = useHomeWork()
  const { data: homeworks, isLoading, error } = getAll

  const { useLessonsList } = useLessons()
  const { data: lessons = [] } = useLessonsList()

  const isCreating = create.isPending
  const isUpdating = update.isPending

  const filteredHomeworks = useMemo(() => {
    if (!homeworks) return []
    const q = search.toLowerCase()
    if (!q) return homeworks
    return homeworks.filter(c => c.titulo?.toLowerCase().includes(q) || c.descripcion?.toLowerCase().includes(q))
  }, [homeworks, search])

  // ─── Handlers ─────────────────────────────────────────────────────

  const handleCreate = (values: FormValues) => {
    const formData = new FormData()
    formData.append('LessonId', values.lessonId.toString())
    formData.append('Titulo', values.titulo)
    formData.append('Descripcion', values.descripcion)
    formData.append('FechaApertura', new Date(values.fechaApertura).toISOString())
    formData.append('FechaEntrega', new Date(values.fechaEntrega).toISOString())
    formData.append('FechaLimite', new Date(values.fechaLimite).toISOString())
    formData.append('Formato', values.formato)

    if (values.urlArchivo) formData.append('UrlArchivo', values.urlArchivo)
    if (values.file && values.file.length > 0) {
      formData.append('File', values.file[0])
      formData.append('TamanoKb', Math.round(values.file[0].size / 1024).toString())
    } else {
      formData.append('TamanoKb', '0')
    }

    create.mutate(formData, {
      onSuccess: () => {
        toast.success('Tarea creada correctamente')
        setCreateOpen(false)
      },
      onError: (err) => toast.error(getApiErrorMessage(err, 'Error al crear')),
    })
  }

  const handleUpdate = (values: FormValues) => {
    if (!editHomework) return
    const formData = new FormData()
    formData.append('Id', editHomework.id.toString())
    formData.append('LessonId', values.lessonId.toString())
    formData.append('Titulo', values.titulo)
    formData.append('Descripcion', values.descripcion)
    formData.append('FechaApertura', new Date(values.fechaApertura).toISOString())
    formData.append('FechaEntrega', new Date(values.fechaEntrega).toISOString())
    formData.append('FechaLimite', new Date(values.fechaLimite).toISOString())
    formData.append('Formato', values.formato)

    if (values.urlArchivo) formData.append('UrlArchivo', values.urlArchivo)
    if (values.file && values.file.length > 0) {
      formData.append('File', values.file[0])
      formData.append('TamanoKb', Math.round(values.file[0].size / 1024).toString())
    }

    update.mutate(
      { id: editHomework.id, data: formData },
      {
        onSuccess: () => {
          toast.success('Tarea actualizada')
          setEditHomework(null)
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'Error al actualizar')),
      },
    )
  }

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar esta tarea?')) {
      remove.mutate(id, {
        onSuccess: () => toast.success('Tarea eliminada'),
        onError: (err) => toast.error(getApiErrorMessage(err, 'Error al eliminar')),
      })
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Tareas</h1>
            <p className="text-sm text-muted-foreground">
              {filteredHomeworks.length} registros
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tarea..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 w-60"
            />
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nueva Tarea</DialogTitle>
                <DialogDescription>
                  Completa la información de la tarea
                </DialogDescription>
              </DialogHeader>

              <HomeworkForm
                lessons={lessons}
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
      <Dialog open={!!editHomework} onOpenChange={(o) => !o && setEditHomework(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
            <DialogDescription>
              Modifica los datos de la tarea
            </DialogDescription>
          </DialogHeader>

          {editHomework && (
            <HomeworkForm
              lessons={lessons}
              defaultValues={{
                lessonId: editHomework.lessonId,
                titulo: editHomework.titulo,
                descripcion: editHomework.descripcion || '',
                fechaApertura: new Date(editHomework.fechaApertura).toISOString().slice(0, 16),
                fechaEntrega: new Date(editHomework.fechaEntrega).toISOString().slice(0, 16),
                fechaLimite: new Date(editHomework.fechaLimite).toISOString().slice(0, 16),
                urlArchivo: editHomework.urlArchivo || '',
                formato: editHomework.formato as any,
                tamanoKb: editHomework.tamanoKb || 0,
              }}
              onSubmit={handleUpdate}
              isPending={isUpdating}
              onCancel={() => setEditHomework(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de tareas</CardTitle>
          <CardDescription>Administra las tareas del sistema</CardDescription>
        </CardHeader>

        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <ServerCrash />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No se pudieron cargar las tareas
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Apertura</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredHomeworks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      No hay tareas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHomeworks.map(homework => (
                    <TableRow key={homework.id}>
                      <TableCell className="font-medium">{homework.titulo}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{homework.descripcion}</TableCell>
                      <TableCell>{new Date(homework.fechaApertura).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(homework.fechaEntrega).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className="uppercase text-xs font-bold text-muted-foreground">{homework.formato as any}</span>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditHomework(homework)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(homework.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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

import { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Pencil, ServerCrash, Search, Trash2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api.error'

import { useHomeworkSubmission } from '@/hooks/useHomeworkSubmiss'
import { useHomeWork } from '@/hooks/useHomeWork'
import type { homeWorkSubmissionDto } from '@/types/homeworkSubmission'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

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

const documentFormats = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rar', 'zip', 'otro'] as const

const submissionSchema = z.object({
  homeworkId: z.coerce.number().min(1, 'Requerido'),
  comentario: z.string().optional(),
  formato: z.enum(documentFormats),
  tamanoKb: z.coerce.number().min(0).optional(),
  urlArchivo: z.string().optional(),
  file: z.any().optional()
})

type FormValues = z.infer<typeof submissionSchema>

function SubmissionForm({
  defaultValues,
  onSubmit,
  isPending,
  onCancel,
  homeworks,
}: {
  defaultValues: Partial<FormValues>
  onSubmit: (values: FormValues) => void
  isPending: boolean
  onCancel: () => void
  homeworks: any[]
}) {
  const { control, handleSubmit, register, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(submissionSchema) as any,
    defaultValues: {
      homeworkId: 0,
      comentario: '',
      formato: 'pdf',
      tamanoKb: 0,
      urlArchivo: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>

        <Controller
          name="homeworkId"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Tarea Destino</FieldLabel>
              <Select value={field.value?.toString() || ''} onValueChange={(val) => field.onChange(Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una tarea..." />
                </SelectTrigger>
                <SelectContent>
                  {homeworks.map(hw => (
                    <SelectItem key={hw.id} value={hw.id.toString()}>
                      {hw.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="comentario"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Comentario (Opcional)</FieldLabel>
              <Input {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

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
              <FieldLabel>URL Alternativa (Opcional)</FieldLabel>
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

export function HomeworkSubmissionsAdminPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editSubmission, setEditSubmission] = useState<homeWorkSubmissionDto | null>(null)
  const [search, setSearch] = useState('')

  const { getAll, submit, update, remove } = useHomeworkSubmission()
  const { data: submissions, isLoading, error } = getAll
  
  const { getAll: getHomeworks } = useHomeWork()
  const { data: homeworks = [] } = getHomeworks

  const isCreating = submit.isPending
  const isUpdating = update.isPending

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return []
    const q = search.toLowerCase()
    if (!q) return submissions
    return submissions.filter(c => 
        c.homeworkTitulo?.toLowerCase().includes(q) || 
        c.comentario?.toLowerCase().includes(q) ||
        c.estudianteNombre?.toLowerCase().includes(q)
    )
  }, [submissions, search])

  const handleCreate = (values: FormValues) => {
    const formData = new FormData()
    formData.append('homeworkId', values.homeworkId.toString())
    formData.append('Formato', values.formato)
    if (values.comentario) formData.append('Comentario', values.comentario)
    if (values.urlArchivo) formData.append('urlArchivo', values.urlArchivo)
    if (values.file && values.file.length > 0) {
      formData.append('File', values.file[0])
      formData.append('TamanoKb', Math.round(values.file[0].size / 1024).toString())
    } else {
      formData.append('TamanoKb', '0')
    }

    submit.mutate(formData, {
      onSuccess: () => {
        toast.success('Entrega creada correctamente')
        setCreateOpen(false)
      },
      onError: (err) => toast.error(getApiErrorMessage(err, 'Error al crear')),
    })
  }

  const handleUpdate = (values: FormValues) => {
    if (!editSubmission) return
    const formData = new FormData()
    formData.append('homeworkId', values.homeworkId.toString())
    formData.append('Formato', values.formato)
    if (values.comentario) formData.append('Comentario', values.comentario)
    if (values.urlArchivo) formData.append('urlArchivo', values.urlArchivo)
    if (values.file && values.file.length > 0) {
      formData.append('File', values.file[0])
      formData.append('TamanoKb', Math.round(values.file[0].size / 1024).toString())
    }

    update.mutate(
      { id: editSubmission.id, data: formData },
      {
        onSuccess: () => {
          toast.success('Entrega actualizada')
          setEditSubmission(null)
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'Error al actualizar')),
      },
    )
  }
  
  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar esta entrega?')) {
        remove.mutate(id, {
            onSuccess: () => toast.success('Entrega eliminada'),
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
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Entregas de Tareas</h1>
            <p className="text-sm text-muted-foreground">
              {filteredSubmissions.length} registros
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar entrega..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 w-60"
            />
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Nueva Entrega
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Subir Tarea</DialogTitle>
                <DialogDescription>
                  Realiza una nueva entrega para un estudiante de forma manual
                </DialogDescription>
              </DialogHeader>

              <SubmissionForm
                homeworks={homeworks}
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
      <Dialog open={!!editSubmission} onOpenChange={(o) => !o && setEditSubmission(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar Entrega</DialogTitle>
            <DialogDescription>
              Modifica los datos de la entrega
            </DialogDescription>
          </DialogHeader>

          {editSubmission && (
            <SubmissionForm
              homeworks={homeworks}
              defaultValues={{
                homeworkId: editSubmission.homeworkId,
                comentario: editSubmission.comentario || '',
                formato: editSubmission.formato as any || 'pdf',
                tamanoKb: editSubmission.tamanoKb || 0,
                urlArchivo: editSubmission.urlArchivo || ''
              }}
              onSubmit={handleUpdate}
              isPending={isUpdating}
              onCancel={() => setEditSubmission(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de entregas</CardTitle>
          <CardDescription>Administra las entregas subidas a la plataforma</CardDescription>
        </CardHeader>

        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <ServerCrash />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No se pudieron cargar las entregas
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Tarea</TableHead>
                  <TableHead>Comentario</TableHead>
                  <TableHead>Estado / Revisión</TableHead>
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
                ) : filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      No hay entregas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.estudianteNombre || `ID: ${sub.usuarioId}`}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{sub.homeworkTitulo || `Tarea ID: ${sub.homeworkId}`}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{sub.comentario || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={sub.revisado ? 'default' : 'secondary'}>
                          {sub.revisado ? 'Calificado' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditSubmission(sub)}
                          disabled={sub.revisado} // Bloquear edición si ya fue calificada usualmente
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(sub.id)}
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

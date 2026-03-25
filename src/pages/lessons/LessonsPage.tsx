import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useLessons } from '@/hooks/useLessons'

// 🔹 Schema
const formSchema = z.object({
  moduleId: z.number(),
  title: z.string().min(1, 'Requerido'),
  description: z.string().min(1, 'Requerido'),
  order: z.number(),
})

type FormValues = z.infer<typeof formSchema>

export function LessonsPage() {
  const [open, setOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any | null>(null)

  const {
    useLessonsList,
    useCreateLesson,
    useUpdateLesson,
    useDeleteLesson,
  } = useLessons()

  const { data: lessons, isLoading, error } = useLessonsList()
  const { mutate: createLesson, isPending: isCreating } = useCreateLesson()
  const { mutate: updateLesson, isPending: isUpdating } = useUpdateLesson()
  const { mutate: deleteLesson, isPending: isDeleting } = useDeleteLesson()

  const isEditing = !!editingLesson

  const { register, handleSubmit, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moduleId: 1,
      title: '',
      description: '',
      order: 1,
    },
  })

  // ✅ Crear
  const handleCreate = () => {
    setEditingLesson(null)
    reset({
      moduleId: 1,
      title: '',
      description: '',
      order: 1,
    })
    setOpen(true)
  }

  // ✅ Editar
  const handleEdit = (lesson: any) => {
    setEditingLesson(lesson)

    setValue('moduleId', lesson.moduleId)
    setValue('title', lesson.title)
    setValue('description', lesson.description)
    setValue('order', lesson.order)

    setOpen(true)
  }

  // ✅ Eliminar
  const handleDelete = (id: number) => {
    if (confirm('¿Seguro que deseas eliminar esta lección?')) {
      deleteLesson(id)
    }
  }

  // ✅ Submit
  const onSubmit = (values: FormValues) => {
    if (isEditing && editingLesson) {
      updateLesson(
        { id: editingLesson.id, data: values },
        {
          onSuccess: () => {
            reset()
            setEditingLesson(null)
            setOpen(false)
          },
        }
      )
    } else {
      createLesson(values, {
        onSuccess: () => {
          reset()
          setOpen(false)
        },
      })
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lecciones</h1>

        <Button onClick={handleCreate}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Nueva Lección
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Lección' : 'Nueva Lección'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica la lección'
                : 'Registra una nueva lección'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="space-y-1">
              <label className="text-sm font-medium">Module ID</label>
              <Input
                type="number"
                {...register('moduleId', { valueAsNumber: true })}
                disabled={isEditing}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Título</label>
              <Input {...register('title')} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Descripción</label>
              <Input {...register('description')} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Orden</label>
              <Input
                type="number"
                {...register('order', { valueAsNumber: true })}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>

              <Button type="submit" disabled={isCreating || isUpdating}>
                {isEditing ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de lecciones</CardTitle>
          <CardDescription>Gestión de lecciones del sistema</CardDescription>
        </CardHeader>

        <CardContent>
          {error ? (
            <p className="text-destructive">Error al cargar datos</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Id Módulo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : lessons?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      No hay lecciones
                    </TableCell>
                  </TableRow>
                ) : (
                  lessons?.map((lesson: any) => (
                    <TableRow key={lesson.id}>
                      <TableCell>{lesson.id}</TableCell>
                      <TableCell>{lesson.moduleId}</TableCell>
                      <TableCell>{lesson.title}</TableCell>
                      <TableCell>{lesson.description}</TableCell>
                      <TableCell>{lesson.order}</TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(lesson)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(lesson.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                        </div>
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
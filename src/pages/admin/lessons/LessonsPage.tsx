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
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
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
import type { Lesson } from '@/hooks/useLessons' // ✅ FIX

// 🔥 Schema
const formSchema = z.object({
  moduleId: z.number(),
  title: z.string().min(1, 'Requerido'),
  description: z.string().optional(),
  order: z.number(),
})

type FormValues = z.infer<typeof formSchema>

export function LessonsPage() {
  const [open, setOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

  const {
    useLessonsList,
    useCreateLesson,
    useUpdateLesson,
    useDeleteLesson,
  } = useLessons()

  const { data: lessons, isLoading, error } = useLessonsList()
  const { mutate: createLesson } = useCreateLesson() // ✅ limpio
  const { mutate: updateLesson } = useUpdateLesson()
  const { mutate: deleteLesson } = useDeleteLesson()

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

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson)

    setValue('moduleId', lesson.moduleId)
    setValue('title', lesson.title)
    setValue('description', lesson.description || '')
    setValue('order', lesson.order)

    setOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('¿Seguro que deseas eliminar esta lección?')) {
      deleteLesson(id)
    }
  }

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

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lecciones</h1>

        <Button onClick={handleCreate}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Nueva Lección
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Lección' : 'Nueva Lección'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <label>Módulo ID</label>
              <Input
                type="number"
                {...register('moduleId', { valueAsNumber: true })}
                disabled={isEditing}
              />
            </div>

            <div>
              <label>Título</label>
              <Input {...register('title')} />
            </div>

            <div>
              <label>Descripción</label>
              <Input {...register('description')} />
            </div>

            <div>
              <label>Orden</label>
              <Input
                type="number"
                {...register('order', { valueAsNumber: true })}
              />
            </div>

            <DialogFooter>
              <Button type="button" onClick={() => setOpen(false)}>
                Cancelar
              </Button>

              <Button type="submit">
                {isEditing ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Listado de lecciones</CardTitle>
        </CardHeader>

        <CardContent>
          {error ? (
            <p>Error al cargar</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ) : (
                  lessons?.map((lesson) => (
                    <TableRow key={lesson.id}>
                      <TableCell>{lesson.id}</TableCell>
                      <TableCell>{lesson.moduleId}</TableCell>
                      <TableCell>{lesson.title}</TableCell>
                      <TableCell>{lesson.description}</TableCell>
                      <TableCell>{lesson.order}</TableCell>

                      <TableCell>
                        <Button onClick={() => handleEdit(lesson)}>
                          <Pencil />
                        </Button>

                        <Button onClick={() => handleDelete(lesson.id)}>
                          <Trash2 />
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
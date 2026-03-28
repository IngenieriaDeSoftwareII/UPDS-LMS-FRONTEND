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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useContents } from '@/hooks/useContents'
import type { Content } from '@/hooks/useContents'
import { useLessons } from '@/hooks/useLessons'
import type { Lesson } from '@/hooks/useLessons'

// 🔥 Schema
const formSchema = z.object({
  lessonId: z.number(),
  type: z.number(),
  title: z.string().optional(),
  order: z.number(),
})

type FormValues = z.infer<typeof formSchema>

export function ContentsPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Content | null>(null)

  const {
    useContentsList,
    useCreateContent,
    useUpdateContent,
    useDeleteContent,
  } = useContents()

  const { useLessonsList } = useLessons()

  const { data: contents, isLoading, error } = useContentsList()
  const { data: lessons } = useLessonsList()

  const { mutate: createContent } = useCreateContent()
  const { mutate: updateContent } = useUpdateContent()
  const { mutate: deleteContent } = useDeleteContent()

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lessonId: 1,
      type: 1,
      title: '',
      order: 1,
    },
  })

  const handleCreate = () => {
    setEditing(null)
    reset()
    setOpen(true)
  }

  const handleEdit = (item: Content) => {
    setEditing(item)

    setValue('lessonId', item.lessonId)
    setValue('type', 1)
    setValue('title', item.title || '')
    setValue('order', item.order)

    setOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('¿Eliminar contenido?')) {
      deleteContent(id)
    }
  }

  const onSubmit = (values: FormValues) => {
    if (editing) {
      updateContent(
        { id: editing.id, data: values },
        {
          onSuccess: () => {
            reset()
            setEditing(null)
            setOpen(false)
          },
        }
      )
    } else {
      createContent(values, {
        onSuccess: () => {
          reset()
          setOpen(false)
        },
      })
    }
  }

  return (
    <div className="space-y-6">

      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Contenidos</h1>

        <Button onClick={handleCreate}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Nuevo
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar Contenido' : 'Nuevo Contenido'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* 🔥 LESSON SELECT */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Lección</label>
              <Select
                onValueChange={(value) =>
                  setValue('lessonId', Number(value))
                }
                defaultValue={String(watch('lessonId'))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una lección" />
                </SelectTrigger>
                <SelectContent>
                  {lessons?.map((l: Lesson) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.title} (ID: {l.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 🔥 TYPE SELECT */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Tipo de Contenido</label>
              <Select
                onValueChange={(value) =>
                  setValue('type', Number(value))
                }
                defaultValue={String(watch('type'))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">🎥 Video</SelectItem>
                  <SelectItem value="1">📄 Documento</SelectItem>
                  <SelectItem value="2">🖼 Imagen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 🔥 TITLE */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Título</label>
              <Input {...register('title')} />
            </div>

            {/* 🔥 ORDER */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Orden</label>
              <Input
                type="number"
                {...register('order', { valueAsNumber: true })}
              />
            </div>

            <DialogFooter>
              <Button type="submit">
                {editing ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Lista de contenidos</CardTitle>
        </CardHeader>

        <CardContent>
          {error ? (
            <p>Error</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Lección</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título</TableHead>
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
                  contents?.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.id}</TableCell>
                      <TableCell>{c.lessonId}</TableCell>
                      <TableCell>{c.type}</TableCell>
                      <TableCell>{c.title}</TableCell>
                      <TableCell>{c.order}</TableCell>

                      <TableCell>
                        <Button onClick={() => handleEdit(c)}>
                          <Pencil />
                        </Button>

                        <Button onClick={() => handleDelete(c.id)}>
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
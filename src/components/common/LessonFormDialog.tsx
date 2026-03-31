import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { useLessons } from '@/hooks/useLessons'
import { useEffect } from 'react'

interface LessonForm {
  title: string
  description?: string
  order: number
  moduleId: number
}

export function LessonFormDialog({ open, onClose, lesson, modules }: any) {
  const { useCreateLesson, useUpdateLesson } = useLessons()

  const createLesson = useCreateLesson()
  const updateLesson = useUpdateLesson()

  const { register, handleSubmit, reset } = useForm<LessonForm>()

  // 🔥 CARGAR DATOS (EDITAR / NUEVO)
  useEffect(() => {
    if (lesson) {
      reset({
        title: lesson.title || '',
        description: lesson.description || '',
        order: lesson.order || 1,
        moduleId: lesson.moduleId || modules?.[0]?.id || 1
      })
    } else {
      reset({
        title: '',
        description: '',
        order: 1,
        moduleId: modules?.[0]?.id || 1
      })
    }
  }, [lesson, modules, reset])

  // 🔥 SUBMIT
  const onSubmit = (data: LessonForm) => {
    if (lesson) {
      updateLesson.mutate(
        {
          id: lesson.id,
          data
        },
        {
          onSuccess: () => onClose()
        }
      )
    } else {
      createLesson.mutate(data, {
        onSuccess: () => onClose()
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {lesson ? 'Editar' : 'Nueva'} Lección
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* 🔹 TÍTULO */}
          <div>
            <label className="text-sm font-semibold">Título</label>
            <Input {...register('title', { required: true })} />
          </div>

          {/* 🔹 DESCRIPCIÓN */}
          <div>
            <label className="text-sm font-semibold">Descripción</label>
            <Input {...register('description')} />
          </div>

          {/* 🔹 ORDEN */}
          <div>
            <label className="text-sm font-semibold">Orden</label>
            <Input
              type="number"
              {...register('order', { valueAsNumber: true })}
            />
          </div>

          {/* 🔥 🔹 MÓDULO (NUEVO) */}
          <div>
            <label className="text-sm font-semibold">Módulo</label>

            <select
              className="w-full border rounded p-2"
              {...register('moduleId', { valueAsNumber: true })}
            >
              <option value="">Seleccione módulo</option>

              {modules?.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.titulo}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>

            <Button type="submit">
              {lesson ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  )
}
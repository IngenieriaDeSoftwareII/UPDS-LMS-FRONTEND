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
}

export function LessonFormDialog({ open, onClose, lesson }: any) {
  const { useCreateLesson, useUpdateLesson } = useLessons()

  const createLesson = useCreateLesson()
  const updateLesson = useUpdateLesson()

  const { register, handleSubmit, reset } = useForm<LessonForm>()

  // 🔥 CARGA AUTOMÁTICA DE DATOS AL EDITAR
  useEffect(() => {
    if (lesson) {
      reset({
        title: lesson.title || '',
        description: lesson.description || '',
        order: lesson.order || 1
      })
    } else {
      reset({
        title: '',
        description: '',
        order: 1
      })
    }
  }, [lesson, reset])

  // 🔥 SUBMIT CORREGIDO (INCLUYE courseId)
  const onSubmit = (data: LessonForm) => {
    const payload = {
      ...data,
      moduleId: lesson?.moduleId || 1 // ⚠️ IMPORTANTE
    }

    if (lesson) {
      updateLesson.mutate(
        {
          id: lesson.id,
          data: payload
        },
        {
          onSuccess: () => {
            onClose()
          }
        }
      )
    } else {
      createLesson.mutate(payload, {
        onSuccess: () => {
          onClose()
        }
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
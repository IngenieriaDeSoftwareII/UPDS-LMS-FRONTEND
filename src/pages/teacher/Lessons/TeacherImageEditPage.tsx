import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { useImageContents } from '@/hooks/useImageContents'
import { useLessons } from '@/hooks/useLessons'

type ImageItem = {
  contentId: number
  imageUrl: string
  altText: string
  content?: {
    lessonId: number
    title?: string
    order?: number
  }
}

export function TeacherImageEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const imageId = Number(id)

  const { useImagesList, useUpdateImage } = useImageContents()
  const { data: images } = useImagesList()
  const { mutate: update, isPending } = useUpdateImage()

  const { useLessonsList } = useLessons()
  const { data: lessons } = useLessonsList()

  const image = (images as ImageItem[] | undefined)?.find(
    (i) => i.contentId === imageId
  )

  const lessonId = image?.content?.lessonId
  const lesson = lessons?.find((l) => l.id === lessonId)
  const moduleId = lesson?.moduleId

  // STATES
  const [title, setTitle] = useState('')
  const [order, setOrder] = useState<number>(1)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // CARGAR DATOS
  useEffect(() => {
    if (image) {
      setTitle(image.content?.title || image.altText)
      setOrder(image.content?.order || 1)
    }
  }, [image])

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const goBack = () => {
    if (moduleId) {
      navigate(`/teacher/modules/${moduleId}/lessons`)
    } else {
      navigate('/teacher/modules')
    }
  }

  const handleUpdate = () => {
    setError(null)

    if (!title.trim()) {
      return setError('El título es obligatorio')
    }

    if (!order || order < 1 || isNaN(order)) {
      return setError('El orden debe ser un número mayor a 0')
    }

    const formData = new FormData()
    formData.append('altText', title)
    formData.append('order', String(order)) 

    if (file) {
      if (!file.type.startsWith('image/')) {
        return setError('Solo se permiten imágenes')
      }

      if (file.size > 5 * 1024 * 1024) {
        return setError('La imagen supera los 5MB')
      }

      formData.append('file', file)
    }

    update(
      {
        id: imageId,
        formData,
      },
      {
        onSuccess: () => {
          alert('Actualizado ✅')
          goBack()
        },
        onError: () => {
          setError('Error al actualizar la imagen ❌')
        }
      }
    )
  }

  if (!image) {
    return <div className="p-6">Imagen no encontrada</div>
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">

      <Button variant="outline" onClick={goBack}>
        ← Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Editar Imagen</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* ERROR */}
          {error && (
            <div className="text-red-500 text-sm border border-red-300 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* INFO */}
          <div className="text-sm text-gray-500 space-y-1">
            <p><strong>Lesson:</strong> {lessonId}</p>
            <p><strong>Módulo:</strong> {moduleId ?? '—'}</p>
          </div>

          {/* PREVIEW */}
          <img
            src={preview || image.imageUrl}
            className="w-40 h-40 object-cover mx-auto rounded"
          />

          {/* TÍTULO */}
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* ORDEN */}
          <div>
            <label className="text-sm font-medium">Orden</label>
            <Input
              type="number"
              min={1}
              value={order}
              onChange={(e) => {
                const val = Number(e.target.value)

                if (isNaN(val)) {
                  setOrder(1)
                } else {
                  setOrder(val)
                }
              }}
            />
          </div>

          {/* ARCHIVO */}
          <div>
            <label className="text-sm font-medium">
              Reemplazar imagen
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return

                if (!f.type.startsWith('image/')) {
                  setError('Solo se permiten imágenes')
                  return
                }

                setError(null)
                setFile(f)
              }}
            />
          </div>

          <Button onClick={handleUpdate} disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}
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

export function ImageEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { useImagesList, useUpdateImage } = useImageContents()
  const { useLessonsList } = useLessons()

  const { data, isLoading } = useImagesList()
  const { data: lessons } = useLessonsList()
  const { mutate: update, isPending } = useUpdateImage()

  const [title, setTitle] = useState('')
  const [lessonId, setLessonId] = useState<number | undefined>() 
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const image = data?.find((i: any) => i.contentId === Number(id))

  useEffect(() => {
    if (image) {
      setTitle(image.altText)
      setLessonId(image.content?.lessonId) // CARGAR ACTUAL
    }
  }, [image])

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const handleUpdate = () => {
    setError(null)

    if (!title.trim()) {
      setError('El título es obligatorio')
      return
    }

    if (!lessonId) {
      setError('Debes seleccionar una lección')
      return
    }

    const formData = new FormData()
    formData.append('altText', title)
    formData.append('lessonId', String(lessonId)) 

    if (file) {
      formData.append('file', file)
    }

    update(
      {
        id: Number(id),
        formData,
      },
      {
        onSuccess: () => {
          alert('Imagen actualizada correctamente ✅')
          navigate('/admin/images')
        },

        onError: (err: any) => {
          const message =
            err?.response?.data?.errors?.[0] ||
            err?.response?.data ||
            'No se pudo actualizar la imagen ❌'

          setError(message)
        },
      }
    )
  }

  if (isLoading) {
    return <div className="p-6">Cargando...</div>
  }

  if (!image) {
    return (
      <div className="p-6 text-red-500">
        Imagen no encontrada ❌
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <Button onClick={() => navigate('/admin/images')}>
        ← Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Editar Imagen</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded">
              {error}
            </div>
          )}

          {/* PREVIEW */}
          <div className="flex justify-center">
            <img
              src={preview || image.imageUrl}
              alt={title}
              className="w-40 h-40 object-cover rounded border"
              onError={(e) => {
                e.currentTarget.src =
                  'https://via.placeholder.com/150?text=Error'
                setError('Error al cargar la imagen')
              }}
            />
          </div>

          {/* FILE */}
          <div>
            <label className="block text-sm font-medium">
              Cambiar imagen
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const selected = e.target.files?.[0]

                if (!selected) return

                if (!selected.type.startsWith('image/')) {
                  setError('Solo se permiten archivos de imagen')
                  return
                }

                setError(null)
                setFile(selected)
              }}
            />
          </div>

          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium">
              Título
            </label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Nombre de la imagen"
            />
          </div>

          {/* LECCIÓN */}
          <div>
            <label className="block text-sm font-medium">
              Lección
            </label>

            <select
              className="w-full border rounded p-2"
              value={lessonId}
              onChange={(e) => setLessonId(Number(e.target.value))}
            >
              <option value="">Seleccionar</option>
              {lessons?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleUpdate} disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
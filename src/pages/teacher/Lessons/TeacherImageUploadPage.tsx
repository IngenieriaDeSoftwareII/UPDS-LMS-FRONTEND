import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { useImageContents } from '@/hooks/useImageContents'

export function TeacherImageUploadPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const lessonIdFromUrl = Number(params.get('lessonId'))

  const lessonId = isNaN(lessonIdFromUrl) ? null : lessonIdFromUrl

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [order, setOrder] = useState<number>(1)
  const [error, setError] = useState<string | null>(null)

  const { useUploadImage } = useImageContents()
  const { mutate: upload, isPending } = useUploadImage()

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  const goBack = () => {
    navigate('/teacher/lessons')
  }

  const handleUpload = () => {
    setError(null)

    if (!file) return setError('Selecciona una imagen')
    if (!lessonId) return setError('Error: lessonId inválido')

    if (!order || order < 1) {
      return setError('El orden debe ser mayor a 0')
    }

    const formData = new FormData()
    formData.append('lessonId', String(lessonId))
    formData.append('title', title.trim() || file.name)
    formData.append('order', String(order)) 
    formData.append('file', file)

    upload(formData, {
      onSuccess: () => {
        alert('Imagen subida correctamente ✅')
        goBack()
      },
      onError: () => {
        setError('Error al subir la imagen ❌')
      },
    })
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">

      <Button variant="outline" onClick={goBack}>
        ← Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Subir Imagen</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* ERROR */}
          {error && (
            <div className="text-red-500 text-sm border border-red-300 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* PREVIEW */}
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-40 h-40 object-cover mx-auto rounded"
            />
          )}

          {/* TÍTULO */}
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input
              placeholder="Ej: Imagen explicativa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* ORDEN*/}
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
            <label className="text-sm font-medium">Imagen</label>
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

                if (!title) setTitle(f.name)
              }}
            />
          </div>

          <Button onClick={handleUpload} disabled={isPending}>
            {isPending ? 'Subiendo...' : 'Subir Imagen'}
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}
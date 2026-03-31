import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
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

type ImageItem = {
  contentId: number
  imageUrl: string
  altText: string
  lessonId: number
}

export function TeacherImageEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const moduleId = Number(params.get('moduleId'))

  const { useImagesList, useUpdateImage } = useImageContents()

  const { data } = useImagesList()
  const { mutate: update, isPending } = useUpdateImage()

  const image = (data as ImageItem[] | undefined)?.find(
    (i) => i.contentId === Number(id)
  )

  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (image) setTitle(image.altText)
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
    const formData = new FormData()
    formData.append('altText', title)

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
          alert('Actualizado ✅')
          goBack()
        },
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

          <img
            src={preview || image.imageUrl}
            className="w-40 h-40 object-cover mx-auto rounded"
          />

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return
              setFile(f)
            }}
          />

          <Button onClick={handleUpdate} disabled={isPending}>
            Guardar cambios
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}
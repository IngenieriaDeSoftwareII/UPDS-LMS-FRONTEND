import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useLessons } from '@/hooks/useLessons'
import { useModules } from '@/hooks/useModules'
import { useCoursesPrueba } from '@/hooks/useCoursesPrueba'
import { useImageContents } from '@/hooks/useImageContents'

export function ImageUploadPage() {
  const navigate = useNavigate()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [lessonId, setLessonId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  // 🔥 HOOKS
  const { useLessonsList } = useLessons()
  const { data: lessons, isLoading } = useLessonsList()

  const { data: modules } = useModules()
  const { data: courses } = useCoursesPrueba()

  const { useUploadImage } = useImageContents()
  const { mutate: upload, isPending } = useUploadImage()

  // 🔥 PREVIEW
  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  // 🔥 FORMATEAR TEXTO DEL COMBO
  const getLessonLabel = (lesson: any) => {
    const module = modules?.find(m => m.id === lesson.moduleId)
    const course = courses?.find(c => c.id === module?.cursoId)

    return `${course?.titulo || 'Curso?'} > ${module?.titulo || 'Módulo?'} > ${lesson.title}`
  }

  const handleUpload = () => {
    setError(null)

    if (!file) {
      setError('Selecciona una imagen')
      return
    }

    if (!lessonId) {
      setError('Selecciona una lección')
      return
    }

    const formData = new FormData()
    formData.append('lessonId', String(lessonId))
    formData.append('title', title || file.name)
    formData.append('file', file)

    upload(formData, {
      onSuccess: () => {
        alert('Imagen subida ✅')
        navigate('/admin/images')
      },
      onError: () => {
        setError('Error al subir la imagen ❌')
      },
    })
  }

  return (
    <div className="space-y-6">

      <Button onClick={() => navigate('/admin/images')}>
        ← Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Subir Imagen</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* ERROR */}
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* PREVIEW */}
          {preview && (
            <div className="flex justify-center">
              <img
                src={preview}
                alt="preview"
                className="w-40 h-40 object-cover rounded border"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://via.placeholder.com/150?text=Error'
                }}
              />
            </div>
          )}

          {/* LECCIÓN */}
          <div>
            <label>Lección</label>
            <Select onValueChange={(v) => setLessonId(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar lección" />
              </SelectTrigger>

              <SelectContent>
                {isLoading ? (
                  <SelectItem value="0">Cargando...</SelectItem>
                ) : (
                  lessons?.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {getLessonLabel(l)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* TÍTULO */}
          <div>
            <label>Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre de la imagen"
            />
          </div>

          {/* ARCHIVO */}
          <div>
            <label>Imagen</label>
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

                setFile(f)

                if (!title) {
                  setTitle(f.name)
                }
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
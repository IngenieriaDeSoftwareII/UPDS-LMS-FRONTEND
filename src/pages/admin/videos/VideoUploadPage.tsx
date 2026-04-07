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

import { useVideoContents } from '@/hooks/useVideoContents'
import { useLessons } from '@/hooks/useLessons'
import { useModules } from '@/hooks/useModules'
import { useCoursesPrueba } from '@/hooks/useCoursesPrueba'

export function VideoUploadPage() {
  const navigate = useNavigate()

  // STATES
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [lessonId, setLessonId] = useState<number | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [order, setOrder] = useState<number>(1)
  const [error, setError] = useState<string | null>(null)

  //  HOOKS
  const { useUploadVideo } = useVideoContents()
  const { mutate: upload, isPending } = useUploadVideo()

  const { useLessonsList } = useLessons()
  const { data: lessons = [], isLoading } = useLessonsList()

  const { data: modules = [] } = useModules()
  const { data: courses = [] } = useCoursesPrueba()

  //  LIMPIAR URL (IMPORTANTE)
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  //  LABEL COMPLETO
  const getLessonLabel = (lesson: any) => {
    const module = modules.find(m => m.id === lesson.moduleId)
    const course = courses.find(c => c.id === module?.cursoId)

    return `${course?.titulo || 'Curso?'} > ${module?.titulo || 'Módulo?'} > ${lesson.title}`
  }

  //  FILE CHANGE
  const handleFileChange = (f: File) => {
    setFile(f)

    const objectUrl = URL.createObjectURL(f)
    setPreview(objectUrl)

    const video = document.createElement('video')
    video.src = objectUrl

    video.onloadedmetadata = () => {
      const seconds = Math.floor(video.duration)
      setDuration(seconds)
    }
  }

  //  SUBMIT
  const handleUpload = () => {
    setError(null)

    if (!file) {
      setError('Selecciona un video')
      return
    }

    if (!lessonId) {
      setError('Selecciona una lección')
      return
    }

    if (duration <= 0) {
      setError('Duración inválida')
      return
    }

    if (order <= 0) {
      setError('El orden debe ser mayor a 0')
      return
    }

    const formData = new FormData()
    formData.append('lessonId', String(lessonId))
    formData.append('title', file.name)
    formData.append('order', String(order))
    formData.append('duracionSeg', String(duration))
    formData.append('file', file)

    upload(formData, {
      onSuccess: () => {
        alert('Video subido ✅')
        navigate('/admin/videos')
      },
      onError: () => {
        setError('Error al subir el video ❌')
      },
    })
  }

  return (
    <div className="space-y-6">

      {/* BACK */}
      <Button onClick={() => navigate('/admin/videos')}>
        ← Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Subir Video</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* ERROR */}
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* PREVIEW VIDEO */}
          {preview && (
            <div className="flex justify-center">
              <video
                src={preview}
                controls
                className="w-full max-w-md rounded-lg border shadow"
              />
            </div>
          )}

          {/* FILE */}
          <div>
            <label>Video</label>
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const f = e.target.files?.[0]

                if (!f) return

                if (!f.type.startsWith('video/')) {
                  setError('Solo se permiten videos')
                  return
                }

                setError(null)
                handleFileChange(f)
              }}
            />
          </div>

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
                ) : lessons.length === 0 ? (
                  <SelectItem value="0">No hay lecciones</SelectItem>
                ) : (
                  lessons.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {getLessonLabel(l)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* ORDEN */}
          <div>
            <label>Orden</label>
            <Input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              min={1}
            />
          </div>

          {/* DURACIÓN */}
          <div>
            <label>Duración (segundos)</label>
            <Input value={duration} readOnly />
          </div>

          {/* SUBMIT */}
          <Button onClick={handleUpload} disabled={isPending}>
            {isPending ? 'Subiendo...' : 'Subir Video'}
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}
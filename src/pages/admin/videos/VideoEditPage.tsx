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

import { useVideoContents } from '@/hooks/useVideoContents'
import { useLessons } from '@/hooks/useLessons'
import { useModules } from '@/hooks/useModules'
import { useCoursesPrueba } from '@/hooks/useCoursesPrueba'

export function VideoEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { useVideosList, useUpdateVideo } = useVideoContents()
  const { useLessonsList } = useLessons()

  const { data, isLoading } = useVideosList()
  const { data: lessons } = useLessonsList()

  const { data: modules } = useModules()
  const { data: courses } = useCoursesPrueba()

  const { mutate: update, isPending } = useUpdateVideo()

  const [lessonId, setLessonId] = useState<number | undefined>()
  const [order, setOrder] = useState<number>(1)
  const [duration, setDuration] = useState<number>(0)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const video = data?.find((v: any) => v.contentId === Number(id))

  // 🔥 cargar datos iniciales
  useEffect(() => {
    if (video) {
      setLessonId(video.content?.lessonId)
      setOrder(video.content?.order || 1)
      setDuration(video.duracionSeg || 0)
    }
  }, [video])

  // 🔥 auto detectar duración si cambia archivo
  const handleFileChange = (f: File) => {
    setFile(f)

    const vid = document.createElement('video')
    vid.src = URL.createObjectURL(f)

    vid.onloadedmetadata = () => {
      setDuration(Math.floor(vid.duration))
      URL.revokeObjectURL(vid.src)
    }
  }

  const handleUpdate = () => {
    setError(null)

    if (!lessonId) {
      setError('Debes seleccionar una lección')
      return
    }

    if (order <= 0) {
      setError('Orden inválido')
      return
    }

    if (duration <= 0) {
      setError('Duración inválida')
      return
    }

    const formData = new FormData()

    formData.append('lessonId', String(lessonId))
    formData.append('order', String(order))
    formData.append('duracionSeg', String(duration))

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
          alert('Video actualizado correctamente ✅')
          navigate('/admin/videos')
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.errors?.[0] ||
            err?.response?.data ||
            'No se pudo actualizar el video ❌'

          setError(message)
        },
      }
    )
  }

  if (isLoading) {
    return <div className="p-6">Cargando...</div>
  }

  if (!video) {
    return (
      <div className="p-6 text-red-500">
        Video no encontrado ❌
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <Button onClick={() => navigate('/admin/videos')}>
        ← Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Editar Video</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded">
              {error}
            </div>
          )}

          {/* VIDEO PREVIEW */}
          <div className="flex justify-center">
            <video
              src={file ? URL.createObjectURL(file) : video.videoUrl}
              controls
              className="w-64 rounded border"
            />
          </div>

          {/* FILE */}
          <div>
            <label className="block text-sm font-medium">
              Cambiar video
            </label>
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const selected = e.target.files?.[0]

                if (!selected) return

                if (!selected.type.startsWith('video/')) {
                  setError('Solo se permiten videos')
                  return
                }

                setError(null)
                handleFileChange(selected)
              }}
            />
          </div>

          {/* DURACIÓN */}
          <div>
            <label className="block text-sm font-medium">
              Duración (segundos)
            </label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>

          {/* ORDEN */}
          <div>
            <label className="block text-sm font-medium">
              Orden
            </label>
            <Input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>

          {/* LECCIÓN */}
          <div>
            <label className="block text-sm font-medium">
              Lección
            </label>

            <select
              className="w-full border rounded p-2"
              value={lessonId ?? ''}
              onChange={(e) => setLessonId(Number(e.target.value))}
            >
              <option value="">Seleccionar</option>

              {lessons?.map((l) => {
                const module = modules?.find(m => m.id === l.moduleId)
                const course = courses?.find(c => c.id === module?.cursoId)

                return (
                  <option key={l.id} value={l.id}>
                    {`Curso: ${course?.titulo || '—'} • Módulo: ${module?.titulo || '—'} • Lección: ${l.title}`}
                  </option>
                )
              })}
            </select>
          </div>

          {/* SUBMIT */}
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
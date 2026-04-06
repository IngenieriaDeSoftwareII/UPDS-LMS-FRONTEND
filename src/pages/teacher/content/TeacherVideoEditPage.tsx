import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'

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

type VideoItem = {
  contentId: number
  videoUrl: string
  duracionSeg: number
  content?: {
    lessonId: number
    order?: number
  }
}

export function TeacherVideoEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const videoId = Number(id)

  const { useVideosList, useUpdateVideo } = useVideoContents()
  const { data: videos } = useVideosList()
  const { mutate: update, isPending } = useUpdateVideo()

  const { useLessonsList } = useLessons()
  const { data: lessons } = useLessonsList()

  const { data: modules } = useModules()
  const { data: courses } = useCoursesPrueba()

  const video = (videos as VideoItem[] | undefined)?.find(
    (v) => v.contentId === videoId
  )

  // STATES
  const [lessonId, setLessonId] = useState<number | undefined>()
  const [order, setOrder] = useState<number>(1)
  const [duration, setDuration] = useState<number>(0)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rol, setRol] = useState<string | null>(null)

  // 🔹 obtener rol
  useEffect(() => {
    const savedState = localStorage.getItem('state')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setRol(parsed.role)
      } catch {
        console.error('Error leyendo rol')
      }
    }
  }, [])

  const isAdmin = rol?.toLowerCase() === 'admin'

  // 🔹 cargar datos iniciales
  useEffect(() => {
    if (video) {
      setLessonId(video.content?.lessonId)
      setOrder(video.content?.order || 1)
      setDuration(video.duracionSeg || 0)
    }
  }, [video])

  // 🔹 preview + duración si cambia archivo
  useEffect(() => {
    if (!file) return

    const url = URL.createObjectURL(file)
    setPreview(url)

    const vid = document.createElement('video')
    vid.src = url

    vid.onloadedmetadata = () => {
      setDuration(Math.floor(vid.duration))
    }

    return () => URL.revokeObjectURL(url)
  }, [file])

  // DERIVADOS
  const selectedLesson = useMemo(
    () => lessons?.find(l => l.id === lessonId),
    [lessonId, lessons]
  )

  const selectedModule = useMemo(
    () => modules?.find(m => m.id === selectedLesson?.moduleId),
    [selectedLesson, modules]
  )

  const selectedCourse = useMemo(
    () => courses?.find(c => c.id === selectedModule?.cursoId),
    [selectedModule, courses]
  )
  const selectedCourseId = selectedCourse?.id
  const goBack = () => {
     navigate(`/teacher/lessons/${selectedCourseId}`)
  }

  const handleUpdate = () => {
    setError(null)

    if (!lessonId) {
      return setError('Debes seleccionar una lección')
    }

    if (!order || order < 1) {
      return setError('Orden inválido')
    }

    if (duration <= 0) {
      return setError('Duración inválida')
    }

    const formData = new FormData()
    formData.append('lessonId', String(lessonId))
    formData.append('order', String(order))
    formData.append('duracionSeg', String(duration))

    if (file) {
      if (!file.type.startsWith('video/')) {
        return setError('Solo se permiten videos')
      }

      // opcional: límite 200MB
      if (file.size > 200 * 1024 * 1024) {
        return setError('El video es demasiado grande (máx 200MB)')
      }

      formData.append('file', file)
    }

    update(
      { id: videoId, formData },
      {
        onSuccess: () => {
          alert('Video actualizado ✅')
          goBack()
        },
        onError: () => {
          setError('Error al actualizar ❌')
        }
      }
    )
  }

  if (!video) {
    return <div className="p-6">Video no encontrado</div>
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">

      <Button variant="outline" onClick={goBack}>
        ← Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Editar Video</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* ERROR */}
          {error && (
            <div className="text-red-500 text-sm border bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* INFO */}
          <div className="text-sm bg-gray-50 p-3 rounded space-y-1">
            <p><strong>Curso:</strong> {selectedCourse?.titulo || '—'}</p>
            <p><strong>Módulo:</strong> {selectedModule?.titulo || '—'}</p>
            <p><strong>Lección:</strong> {selectedLesson?.title || '—'}</p>
          </div>

          {/* PREVIEW */}
          <video
            src={preview || video.videoUrl}
            controls
            className="w-full rounded-lg border shadow"
          />

          {/* LECCIÓN */}
          <div>
            <label className="text-sm font-medium">Lección</label>

            <select
              className={`w-full border rounded p-2 ${!isAdmin ? 'bg-gray-100 opacity-70 cursor-not-allowed' : ''}`}
              value={lessonId ?? ''}
              onChange={(e) => setLessonId(Number(e.target.value))}
              disabled={!isAdmin}
            >
              <option value="">Seleccionar</option>

              {lessons?.map(l => {
                const module = modules?.find(m => m.id === l.moduleId)
                const course = courses?.find(c => c.id === module?.cursoId)

                return (
                  <option key={l.id} value={l.id}>
                    {`Curso: ${course?.titulo || '—'} | Módulo: ${module?.titulo || '—'} | Lección: ${l.title}`}
                  </option>
                )
              })}
            </select>
          </div>

          {/* ORDEN */}
          <div>
            <label className="text-sm font-medium">Orden</label>
            <Input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>

          {/* DURACIÓN */}
          <div>
            <label className="text-sm font-medium">
              Duración (segundos)
            </label>
            <Input value={duration} readOnly />
          </div>

          {/* FILE */}
          <div>
            <label className="text-sm font-medium">
              Reemplazar video
            </label>
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return

                if (!f.type.startsWith('video/')) {
                  setError('Solo videos')
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
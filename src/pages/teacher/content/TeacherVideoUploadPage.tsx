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

import { useVideoContents } from '@/hooks/useVideoContents'

export function TeacherVideoUploadPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const lessonIdFromUrl = Number(params.get('lessonId'))
  const lessonId = isNaN(lessonIdFromUrl) ? null : lessonIdFromUrl
  const courseIdFromUrl = Number(params.get('courseId'))


  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [order, setOrder] = useState<number>(1)
  const [error, setError] = useState<string | null>(null)

  const { useUploadVideo } = useVideoContents()
  const { mutate: upload, isPending } = useUploadVideo()

  // 🎥 preview + duración automática
  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)

    const video = document.createElement('video')
    video.src = url

    video.onloadedmetadata = () => {
      setDuration(Math.floor(video.duration))
    }

    return () => URL.revokeObjectURL(url)
  }, [file])

  const goBack = () => {
    navigate(`/teacher/lessons/${courseIdFromUrl}`)
  }

  const handleUpload = () => {
    setError(null)

    if (!file) return setError('Selecciona un video')
    if (!lessonId) return setError('lessonId inválido')

    if (!file.type.startsWith('video/')) {
      return setError('Solo se permiten videos')
    }

    if (duration <= 0) {
      return setError('Duración inválida')
    }

    if (order < 1) {
      return setError('El orden debe ser mayor a 0')
    }

    const formData = new FormData()
    formData.append('lessonId', String(lessonId))
    formData.append('title', file.name)
    formData.append('order', String(order))
    formData.append('duracionSeg', String(duration))
    formData.append('file', file)

    upload(formData, {
      onSuccess: () => {
        alert('Video subido correctamente ✅')
        goBack()
      },
      onError: () => {
        setError('Error al subir el video ❌')
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
          <CardTitle>Subir Video</CardTitle>
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
            <video
              src={preview}
              controls
              className="w-full rounded-lg border shadow"
            />
          )}

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

          {/* ARCHIVO */}
          <div>
            <label className="text-sm font-medium">Video</label>
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
                setFile(f)
              }}
            />
          </div>

          <Button onClick={handleUpload} disabled={isPending}>
            {isPending ? 'Subiendo...' : 'Subir Video'}
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}
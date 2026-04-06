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

import { useImageContents } from '@/hooks/useImageContents'
import { useLessons } from '@/hooks/useLessons'
import { useModules } from '@/hooks/useModules'
import { useCoursesPrueba } from '@/hooks/useCoursesPrueba'

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

  const { data: modules } = useModules()
  const { data: courses } = useCoursesPrueba()

  const image = (images as ImageItem[] | undefined)?.find(
    (i) => i.contentId === imageId
  )

  //  STATES
  const [lessonId, setLessonId] = useState<number | undefined>()
  const [title, setTitle] = useState('')
  const [order, setOrder] = useState<number>(1)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rol, setRol] = useState<string | null>(null)

  useEffect(() => {
    const savedState = localStorage.getItem('state')
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        setRol(parsedState.role)
      } catch (error) {
        console.error("Error al leer el rol del localStorage", error)
      }
    }
  }, [])

  const isAdmin = rol === 'admin' || rol === 'Admin' || rol === 'ADMIN'

  // 🔹 cargar datos
  useEffect(() => {
    if (image) {
      setTitle(image.content?.title || image.altText)
      setOrder(image.content?.order || 1)
      setLessonId(image.content?.lessonId)
    }
  }, [image])

  // 🔹 preview
  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
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

    if (!title.trim()) {
      return setError('El título es obligatorio')
    }

    if (!lessonId) {
      return setError('Debes seleccionar una lección')
    }

    if (!order || order < 1 || isNaN(order)) {
      return setError('El orden debe ser mayor a 0')
    }

    const formData = new FormData()
    formData.append('altText', title)
    formData.append('order', String(order))
    formData.append('lessonId', String(lessonId))

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
      { id: imageId, formData },
      {
        onSuccess: () => {
          alert('Imagen actualizada ✅')
          goBack()
        },
        onError: () => {
          setError('Error al actualizar ❌')
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
            <div className="text-red-500 text-sm border bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/*  INFO  */}
          <div className="text-sm bg-gray-50 p-3 rounded space-y-1">
            <p><strong>Curso:</strong> {selectedCourse?.titulo || '—'}</p>
            <p><strong>Módulo:</strong> {selectedModule?.titulo || '—'}</p>
            <p><strong>Lección:</strong> {selectedLesson?.title || '—'}</p>
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

          {/*  LECCIÓN */}
          <div>
            <label className="text-sm font-medium">Lección asignada</label>

            <select
              className={`w-full border rounded p-2 ${!isAdmin ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
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

          {/* FILE */}
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
                  setError('Solo imágenes')
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
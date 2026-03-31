import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import { useDocumentContents } from '@/hooks/useDocumentContents'
import { useLessons } from '@/hooks/useLessons'

export function TeacherDocumentEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // 🔥 VALIDACIÓN ID
  const documentId = Number(id)
  const isValidId = !isNaN(documentId)

  const { useDocumentById, useUpdateDocument } = useDocumentContents()
  const { data: doc, isLoading, isError } = useDocumentById(
    isValidId ? documentId : 0
  )

  const { mutate: update, isPending } = useUpdateDocument()

  // 🔥 TRAER LESSON PARA SACAR moduleId
  const { useLessonsList } = useLessons()
  const { data: lessons } = useLessonsList()

  const lesson = lessons?.find(
    (l) => l.id === doc?.content?.lessonId
  )

  const moduleId = lesson?.moduleId

  // 🔹 state
  const [title, setTitle] = useState('')
  const [order, setOrder] = useState(1)
  const [pageCount, setPageCount] = useState<number | undefined>()
  const [file, setFile] = useState<File | null>(null)

  // 🔹 cargar datos
  useEffect(() => {
    if (doc) {
      setTitle(doc.content?.title || '')
      setOrder(doc.content?.order || 1)
      setPageCount(doc.pageCount)
    }
  }, [doc])

  // 🔙 volver seguro
  const goBack = () => {
    if (moduleId) {
      navigate(`/teacher/modules/${moduleId}/lessons`)
    } else {
      navigate('/teacher/modules') // fallback
    }
  }

  const handleUpdate = () => {
    if (!title.trim()) {
      alert('El título no puede estar vacío')
      return
    }

    // 🔹 SOLO METADATA
    if (!file) {
      update(
        {
          id: documentId,
          data: { title, order, pageCount }
        },
        {
          onSuccess: () => {
            alert('Documento actualizado ✅')
            goBack()
          }
        }
      )
      return
    }

    // 🔹 CON ARCHIVO
    const lessonId = doc?.content?.lessonId

    if (!lessonId) {
      alert('Error: lessonId no encontrado')
      return
    }

    const formData = new FormData()
    formData.append('File', file)
    formData.append('Title', title)
    formData.append('Order', String(order))
    formData.append('LessonId', String(lessonId))

    if (pageCount) {
      formData.append('PageCount', String(pageCount))
    }

    update(
      { id: documentId, data: formData },
      {
        onSuccess: () => {
          alert('Archivo actualizado ✅')
          goBack()
        }
      }
    )
  }

  // 🔹 estados
  if (!isValidId) {
    return <p className="p-6 text-red-500">ID inválido</p>
  }

  if (isLoading) {
    return <p className="p-6">Cargando...</p>
  }

  if (isError || !doc) {
    return <p className="p-6 text-red-500">Error al cargar</p>
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">

      {/* 🔙 VOLVER */}
      <Button variant="outline" onClick={goBack}>
        ← Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Editar Documento</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

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
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>

          {/* PÁGINAS */}
          <div>
            <label className="text-sm font-medium">
              Número de páginas
            </label>
            <Input
              type="number"
              min={1}
              value={pageCount || ''}
              onChange={(e) => {
                const val = Number(e.target.value)
                setPageCount(val > 0 ? val : undefined)
              }}
            />
          </div>

          {/* ARCHIVO */}
          <div>
            <label className="text-sm font-medium">
              Reemplazar archivo
            </label>
            <Input
              type="file"
              onChange={(e) => {
                const selected = e.target.files?.[0] || null
                setFile(selected)

                if (selected && !title) {
                  setTitle(selected.name)
                }
              }}
            />
          </div>

          {/* BOTÓN */}
          <Button onClick={handleUpdate} disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}
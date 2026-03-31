import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDocumentContents } from '@/hooks/useDocumentContents'

export function TeacherDocumentEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { useDocumentById, useUpdateDocument } = useDocumentContents()
  const { data: doc, isLoading, isError } = useDocumentById(Number(id))
  const { mutate: update, isPending } = useUpdateDocument()

  const [title, setTitle] = useState('')
  const [order, setOrder] = useState(1)
  const [pageCount, setPageCount] = useState<number | undefined>()
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (doc) {
      setTitle(doc.content?.title || '')
      setOrder(doc.content?.order || 1)
      setPageCount(doc.pageCount)
    }
  }, [doc])

  const goBack = () => navigate('/teacher/lessons')

  const handleUpdate = () => {
    if (!title.trim()) {
      alert('El título no puede estar vacío')
      return
    }

    // 🔹 SOLO METADATA
    if (!file) {
      update(
        { id: Number(id), data: { title, order, pageCount } },
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

    const formData = new FormData()
    formData.append('File', file)
    formData.append('Title', title)
    formData.append('Order', String(order))
    formData.append('LessonId', String(lessonId))
    if (pageCount) formData.append('PageCount', String(pageCount))

    update(
      { id: Number(id), data: formData },
      {
        onSuccess: () => {
          alert('Archivo actualizado ✅')
          goBack()
        }
      }
    )
  }

  if (isLoading) return <p>Cargando...</p>
  if (isError) return <p>Error</p>

  return (
    <div className="space-y-6 max-w-xl mx-auto">

      {/* VOLVER */}
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
            <label className="text-sm font-medium">Número de páginas</label>
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
            <label className="text-sm font-medium">Reemplazar archivo</label>
            <Input
              type="file"
              onChange={(e) => {
                const selected = e.target.files?.[0] || null
                setFile(selected)

                // 🔥 opcional: actualizar título automáticamente
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
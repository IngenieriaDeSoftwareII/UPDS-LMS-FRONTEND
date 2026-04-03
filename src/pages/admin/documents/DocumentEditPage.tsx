import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDocumentContents } from '@/hooks/useDocumentContents'

export function DocumentEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { useDocumentById, useUpdateDocument } = useDocumentContents()
  const { data: doc, isLoading, isError } = useDocumentById(Number(id))
  const { mutate: update } = useUpdateDocument()

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

  const handleUpdate = () => {
    if (!title.trim()) {
      alert('El título no puede estar vacío')
      return
    }

    // Obtener lessonId (necesario tanto para metadatos como para archivo)
    const lessonId = doc?.content?.lessonId
    if (!lessonId || lessonId <= 0) {
      alert('Error: La lección asociada no es válida.')
      return
    }

    // Caso 1: Solo actualización de metadatos (sin archivo)
    if (!file) {
      update(
        { 
          id: Number(id), 
          data: { 
            Title: title, 
            Order: order, 
            PageCount: pageCount,
            LessonId: lessonId
          } 
        },
        {
          onSuccess: () => {
            alert('Documento actualizado correctamente ✅')
            navigate('/admin/documents')
          },
          onError: (err: any) => {
            console.error(err)
            alert('Error al actualizar ❌\n' + (err?.response?.data || err.message))
          },
        }
      )
      return
    }

    // Caso 2: Reemplazo de archivo (FormData)
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
          alert('Archivo reemplazado correctamente ✅')
          navigate('/admin/documents')
        },
        onError: (err: any) => {
          console.error(err)
          alert('Error reemplazando archivo ❌\n' + (err?.response?.data || err.message))
        },
      }
    )
  }

  if (isLoading) return <p>Cargando documento...</p>
  if (isError) return <p>Error al cargar documento</p>
  if (!doc) return <p>Documento no encontrado</p>

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/admin/documents')}>
        ← Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Editar Documento</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label>Título</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label>Orden</label>
            <Input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Páginas</label>
            <Input
              type="number"
              min={1}
              value={pageCount}
              onChange={(e) => setPageCount(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Reemplazar archivo</label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <Button onClick={handleUpdate}>
            Guardar cambios
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDocumentContents } from '@/hooks/useDocumentContents'

export function TeacherDocumentUploadPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const lessonIdFromUrl = Number(params.get('lessonId'))

  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [pageCount, setPageCount] = useState<number | undefined>()
  const [order, setOrder] = useState(1)

  const { useUploadDocument } = useDocumentContents()
  const { mutate: upload, isPending } = useUploadDocument()

  const goBack = () => navigate('/teacher/lessons')

  const handleUpload = () => {
    if (!file) return alert('Selecciona archivo')
    if (!lessonIdFromUrl) return alert('Error: lessonId')
    if (!title.trim()) return alert('El título es obligatorio')

    upload(
      {
        file,
        lessonId: lessonIdFromUrl,
        title,
        pageCount,
        order
      },
      {
        onSuccess: () => {
          alert('Documento subido ✅')
          goBack()
        },
        onError: () => {
          alert('Error al subir ❌')
        }
      }
    )
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">

      {/* VOLVER */}
      <Button variant="outline" onClick={goBack}>
        ← Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Subir Documento</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* TÍTULO */}
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input
              placeholder="Ej: Tema 1 - Introducción"
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

          {/* ARCHIVO */}
          <div>
            <label className="text-sm font-medium">Archivo</label>
            <Input
              type="file"
              onChange={(e) => {
                const selected = e.target.files?.[0] || null
                setFile(selected)

                // 🔥 AUTO TÍTULO como plataforma real
                if (selected && !title) {
                  setTitle(selected.name)
                }
              }}
            />
          </div>

          {/* PÁGINAS */}
          <div>
            <label className="text-sm font-medium">Número de páginas</label>
            <Input
              type="number"
              min={1}
              placeholder="Opcional"
              onChange={(e) => {
                const val = Number(e.target.value)
                setPageCount(val > 0 ? val : undefined)
              }}
            />
          </div>

          {/* BOTÓN */}
          <Button onClick={handleUpload} disabled={isPending}>
            {isPending ? 'Subiendo...' : 'Subir Documento'}
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}
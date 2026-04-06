import { useState } from 'react'
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

import { useDocumentContents } from '@/hooks/useDocumentContents'
import { useLessons } from '@/hooks/useLessons'
import type { Lesson } from '@/services/lessons.service'

export function DocumentUploadPage() {
  const navigate = useNavigate()

  const [file, setFile] = useState<File | null>(null)
  const [lessonId, setLessonId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [pageCount, setPageCount] = useState<number | undefined>()
  const [order, setOrder] = useState<number>(1)

  const { useUploadDocument } = useDocumentContents()
  const { useLessonsList } = useLessons()

  const { mutate: upload, isPending } = useUploadDocument()
  const { data: lessons, isLoading } = useLessonsList()

  const handleUpload = () => {
    if (!file) {
      alert('Selecciona un archivo')
      return
    }

    if (!lessonId) {
      alert('Selecciona una lección')
      return
    }

    if (!title.trim()) {
      alert('Ingresa un título')
      return
    }

    upload(
      {
        file,
        lessonId,
        title, 
        pageCount,
        order 
      },
      {
        onSuccess: () => {
          alert('Documento subido correctamente ✅')
          navigate('/admin/documents')
        },
        onError: (err: any) => {
          console.error(err)

          if (err?.response) {
            alert('Error backend: ' + JSON.stringify(err.response.data))
          } else {
            alert('Error al subir documento ❌')
          }
        },
      }
    )
  }

  return (
    <div className="space-y-6">

      {/* BOTÓN VOLVER */}
      <Button variant="outline" onClick={() => navigate('/admin/documents')}>
        ← Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Subir Documento</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/*  LECCIÓN */}
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
                  lessons?.map((l: Lesson) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* TÍTULO */}
          <div>
            <label>Título del documento</label>
            <Input
              type="text"
              placeholder="Ej: Tema 1 - Introducción"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          {/* ORDER */}
          <div>
            <label>Orden</label>
            <Input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>

          {/*  ARCHIVO */}
          <div>
            <label>Archivo</label>
            <Input
              id="fileInput"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
              onChange={(e) => {
                const selected = e.target.files?.[0] || null
                setFile(selected)

                if (selected && !title) {
                  setTitle(selected.name)
                }
              }}
            />
          </div>

          {/*  PÁGINAS */}
          <div>
            <label>Número de páginas</label>
            <Input
              type="number"
              min={1}
              onChange={(e) => {
                const val = Number(e.target.value)
                setPageCount(val > 0 ? val : undefined)
              }}
            />
          </div>

          {/*  BOTÓN */}
          <Button onClick={handleUpload} disabled={isPending}>
            {isPending ? 'Subiendo...' : 'Subir Documento'}
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}
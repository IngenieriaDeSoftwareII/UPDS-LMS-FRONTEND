import { useState } from 'react'
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
import type { Lesson } from '@/hooks/useLessons'

export function DocumentUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [lessonId, setLessonId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [pageCount, setPageCount] = useState<number | undefined>()

  const { useUploadDocument } = useDocumentContents()
  const { useLessonsList } = useLessons()

  const { mutate: upload, isPending } = useUploadDocument()
  const { data: lessons, isLoading } = useLessonsList()

  // 🔥 DEBUG COMPLETO
  const handleUpload = () => {
    console.log('CLICK')

    if (!file) {
      alert('Selecciona un archivo')
      return
    }

    if (!lessonId) {
      alert('Selecciona una lección')
      return
    }

    console.log('DATA A ENVIAR:', {
      file,
      lessonId,
      title,
      pageCount,
    })

    upload(
      {
        file,
        lessonId,
        title,
        pageCount,
      },
      {
        onSuccess: (res) => {
          console.log('SUCCESS:', res)
          alert('Documento subido correctamente ✅')

          // 🔥 RESET FORM
          setFile(null)
          setLessonId(null)
          setTitle('')
          setPageCount(undefined)
        },
        onError: (err: any) => {
          console.error('ERROR COMPLETO:', err)

          // 🔥 VER ERROR REAL DEL BACKEND
          if (err?.response) {
            console.error('BACKEND ERROR:', err.response.data)
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

      <Card>
        <CardHeader>
          <CardTitle>Subir Documento</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* 🔥 SELECT LESSON */}
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

          {/* 🔥 FILE */}
          <div>
            <label>Archivo</label>
            <Input
              type="file"
              onChange={(e) => {
                const selected = e.target.files?.[0] || null
                console.log('FILE:', selected)
                setFile(selected)
              }}
            />
          </div>

          {/* 🔥 TITLE */}
          <div>
            <label>Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 🔥 PAGE COUNT */}
          <div>
            <label>Número de páginas</label>
            <Input
              type="number"
              onChange={(e) => {
                const val = Number(e.target.value)
                console.log('PAGE COUNT:', val)
                setPageCount(val)
              }}
            />
          </div>

          <Button onClick={handleUpload} disabled={isPending}>
            {isPending ? 'Subiendo...' : 'Subir Documento'}
          </Button>

        </CardContent>
      </Card>

    </div>
  )
}
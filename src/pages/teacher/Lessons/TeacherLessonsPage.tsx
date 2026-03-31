import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PlusCircle, Pencil, Trash2, FileText } from 'lucide-react'
import { useLessons } from '@/hooks/useLessons'
import { useDocumentContents } from '@/hooks/useDocumentContents'
import { useState, useEffect } from 'react'
import { LessonFormDialog } from '@/components/LessonFormDialog'
import { useNavigate } from 'react-router-dom'

export function TeacherLessonsPage() {
  const { useLessonsList, useDeleteLesson } = useLessons()
  const { data: lessons } = useLessonsList()
  const deleteLesson = useDeleteLesson()

  const { useDocumentsList, useDeleteDocument } = useDocumentContents()
  const { data: documents } = useDocumentsList()
  const deleteDocument = useDeleteDocument()

  const [open, setOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any>(null)

  // 🆕 GUÍAS (persistentes)
  const [guides, setGuides] = useState<{ [key: number]: string }>({})
  const [editingGuideLessonId, setEditingGuideLessonId] = useState<number | null>(null)
  const [guideText, setGuideText] = useState('')

  const navigate = useNavigate()

  // 🔥 CARGAR DESDE LOCALSTORAGE
  useEffect(() => {
    const saved = localStorage.getItem('guides')
    if (saved) setGuides(JSON.parse(saved))
  }, [])

  // 🔥 GUARDAR EN LOCALSTORAGE
  const saveGuide = (lessonId: number) => {
    const updated = {
      ...guides,
      [lessonId]: guideText
    }

    setGuides(updated)
    localStorage.setItem('guides', JSON.stringify(updated))

    setEditingGuideLessonId(null)
    setGuideText('')
  }

  const handleDeleteDoc = (id: number) => {
    if (confirm('¿Eliminar documento?')) {
      deleteDocument.mutate(id)
    }
  }

  const handleOpenDoc = async (contentId: number) => {
    try {
      const res = await fetch(
        `http://localhost:5024/api/DocumentContents/GetSasUrl/${contentId}`
      )

      const data = await res.json()

      if (!data?.url) {
        alert('No se encontró el archivo')
        return
      }

      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error(error)
      alert('No se pudo abrir el documento')
    }
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Mis Lecciones</h1>

        <Button onClick={() => { setEditingLesson(null); setOpen(true) }}>
          <PlusCircle className="mr-2 w-4 h-4" />
          Nueva
        </Button>
      </div>

      {/* LISTA */}
      {lessons?.map(lesson => {

        const lessonDocs = documents
          ?.filter(d => d.content.lessonId === lesson.id)
          ?.sort((a, b) => (a.content?.order || 0) - (b.content?.order || 0))

        return (
          <Card key={lesson.id}>

            {/* HEADER */}
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>{lesson.title}</CardTitle>
                <p className="text-sm text-gray-500">
                  {lesson.description}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    navigate(`/teacher/documents/upload?lessonId=${lesson.id}`)
                  }
                >
                  <PlusCircle />
                </Button>

                <Button
                  onClick={() => {
                    setEditingLesson(lesson)
                    setOpen(true)
                  }}
                >
                  <Pencil />
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => deleteLesson.mutate(lesson.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            </CardHeader>

            <CardContent>

              {/* 🆕 GUÍA ARRIBA */}
              <div className="mb-6 border-b pb-4">

                <h3 className="font-semibold mb-3">📘 Guía</h3>

                <Button
                  className="mb-3"
                  onClick={() => {
                    setEditingGuideLessonId(lesson.id)
                    setGuideText(guides[lesson.id] || '')
                  }}
                >
                  Crear guía
                </Button>

                {/* EDITOR */}
                {editingGuideLessonId === lesson.id && (
                  <div className="space-y-2">
                    <textarea
                      className="w-full border rounded p-2"
                      rows={5}
                      placeholder="Escribe la guía aquí..."
                      value={guideText}
                      onChange={(e) => setGuideText(e.target.value)}
                    />

                    <Button onClick={() => saveGuide(lesson.id)}>
                      Guardar
                    </Button>
                  </div>
                )}

                {/* MOSTRAR */}
                {guides[lesson.id] && (
                  <Card className="mt-3">
                    <CardContent className="p-3">
                      <p className="text-sm whitespace-pre-line">
                        {guides[lesson.id]}
                      </p>
                    </CardContent>
                  </Card>
                )}

              </div>

              {/* DOCUMENTOS */}
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText /> Documentos
              </h3>

              {lessonDocs?.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No hay documentos
                </p>
              ) : (
                <div className="space-y-2">
                  {lessonDocs?.map(doc => (
                    <div
                      key={doc.contentId}
                      onClick={() => handleOpenDoc(doc.contentId)}
                      className="flex justify-between items-center border p-3 rounded cursor-pointer hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="text-red-500" size={18} />
                        <div>
                          <p className="font-medium">
                            {doc.content.title || 'Sin título'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/teacher/documents/edit/${doc.contentId}`)
                          }}
                        >
                          <Pencil size={16} />
                        </Button>

                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteDoc(doc.contentId)
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </CardContent>
          </Card>
        )
      })}

      <LessonFormDialog
        open={open}
        onClose={() => setOpen(false)}
        lesson={editingLesson}
      />

    </div>
  )
}
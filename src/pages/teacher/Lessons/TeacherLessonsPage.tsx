import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PlusCircle, Pencil, Trash2, FileText } from 'lucide-react'
import { useLessons } from '@/hooks/useLessons'
import { useDocumentContents } from '@/hooks/useDocumentContents'
import { useState } from 'react'
import { LessonFormDialog } from '@/components/layout/LessonFormDialog'
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

  const navigate = useNavigate()

  // 🗑 eliminar documento
  const handleDeleteDoc = (id: number) => {
    if (confirm('¿Eliminar documento?')) {
      deleteDocument.mutate(id)
    }
  }

  // 👁 abrir documento en nueva pestaña
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

        // 🔥 ORDENADO POR ORDER
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

                {/* ➕ CREAR DOC */}
                <Button
                  onClick={() =>
                    navigate(`/teacher/documents/upload?lessonId=${lesson.id}`)
                  }
                >
                  <PlusCircle />
                </Button>

                {/* EDITAR LECCIÓN */}
                <Button
                  onClick={() => {
                    setEditingLesson(lesson)
                    setOpen(true)
                  }}
                >
                  <Pencil />
                </Button>

                {/* ELIMINAR LECCIÓN */}
                <Button
                  variant="destructive"
                  onClick={() => deleteLesson.mutate(lesson.id)}
                >
                  <Trash2 />
                </Button>

              </div>
            </CardHeader>

            {/* DOCUMENTOS */}
            <CardContent>

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

                      {/* INFO */}
                      <div className="flex items-center gap-3">
                        <FileText className="text-red-500" size={18} />

                        <div>
                          <p className="font-medium">
                            {doc.content.title || 'Sin título'}
                          </p>

                          <p className="text-xs text-gray-400">
                            Orden: {doc.content.order ?? 0}
                          </p>

                          <p className="text-xs text-gray-400">
                            {doc.format || 'Archivo'} • {doc.sizeKb ? `${doc.sizeKb} KB` : ''}
                          </p>
                        </div>
                      </div>

                      {/* ACCIONES */}
                      <div className="flex gap-2">

                        {/* EDITAR */}
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

                        {/* ELIMINAR */}
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

      {/* MODAL LECCIÓN */}
      <LessonFormDialog
        open={open}
        onClose={() => setOpen(false)}
        lesson={editingLesson}
      />

    </div>
  )
}
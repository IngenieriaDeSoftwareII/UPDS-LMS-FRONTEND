import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PlusCircle, Pencil, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { PageHeader } from '@/components/common/PageHeader'
import { ConfirmDeleteButton } from '@/components/common/ConfirmDeleteButton'

import { useLessons } from '@/hooks/useLessons'
import { useDocumentContents } from '@/hooks/useDocumentContents'
import { useModules } from '@/hooks/useModules'

import { LessonFormDialog } from '@/components/common/LessonFormDialog'
import { AddContentModal } from '@/components/common/AddContentModal'

import http from '@/lib/http'

export function TeacherLessonsPage() {
  const navigate = useNavigate()
  const { moduleId } = useParams()

  // 🔹 lessons
  const { useLessonsList, useDeleteLesson } = useLessons()
  const { data: lessons, isLoading, error } = useLessonsList()
  const deleteLesson = useDeleteLesson()

  // 🔹 documents
  const { useDocumentsList, useDeleteDocument } = useDocumentContents()
  const { data: documents } = useDocumentsList()
  const deleteDocument = useDeleteDocument()

  // 🔹 modules (para modal)
  const { data: modules } = useModules()

  // 🔹 state
  const [open, setOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any>(null)

  const [openContentModal, setOpenContentModal] = useState(false)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)

  // 🔥 validar moduleId
  const parsedModuleId = Number(moduleId)

  // 🔥 FILTRO POR MÓDULO (seguro)
  const filteredLessons = lessons
  ?.filter((l) => Number(l.moduleId) === parsedModuleId)
  ?.sort((a, b) => Number(a.order || 0) - Number(b.order || 0))

  // 🔹 abrir documento
  const handleOpenDoc = async (contentId: number) => {
    try {
      const res = await http.get(`/DocumentContents/GetSasUrl/${contentId}`)

      if (!res.data?.url) {
        alert('No se encontró el archivo')
        return
      }

      window.open(res.data.url, '_blank')
    } catch {
      alert('No se pudo abrir el documento')
    }
  }

  // 🔹 eliminar documento
  const handleDeleteDoc = (id: number) => {
    if (confirm('¿Eliminar documento?')) {
      deleteDocument.mutate(id)
    }
  }

  // 🔹 seleccionar tipo contenido (🔥 FIX IMPORTANTE)
  const handleSelectContentType = () => {
    if (!selectedLessonId) return

    navigate(
      `/teacher/documents/upload?lessonId=${selectedLessonId}&moduleId=${parsedModuleId}`
    )

    setOpenContentModal(false)
  }

  // 🔹 loading
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  // 🔹 error
  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error al cargar las lecciones ❌
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* 🔙 VOLVER */}
      <Button
        variant="outline"
        onClick={() => navigate('/teacher/modules')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a módulos
      </Button>

      {/* HEADER */}
      <PageHeader
        title="Lecciones del módulo"
        buttonText="Nueva Lección"
        icon={<PlusCircle className="w-4 h-4 mr-2" />}
        onClick={() => {
          setEditingLesson(null)
          setOpen(true)
        }}
      />

      {/* LISTA */}
      {filteredLessons?.length === 0 ? (
        <p className="text-gray-500">
          No hay lecciones en este módulo
        </p>
      ) : (
        filteredLessons?.map((lesson) => {

          const lessonDocs = documents
            ?.filter((d) => d.content.lessonId === lesson.id)
            ?.sort(
              (a, b) =>
                (a.content?.order || 0) - (b.content?.order || 0)
            )

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

                  {/* ADD CONTENT */}
                  <Button
                    onClick={() => {
                      setSelectedLessonId(lesson.id)
                      setOpenContentModal(true)
                    }}
                  >
                    <PlusCircle className="w-4 h-4" />
                  </Button>

                  {/* EDIT */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingLesson(lesson)
                      setOpen(true)
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  {/* DELETE */}
                  <ConfirmDeleteButton
                    onConfirm={() =>
                      deleteLesson.mutate(lesson.id)
                    }
                  />

                </div>
              </CardHeader>

              <CardContent>

                <h3 className="font-semibold mb-2">
                  Documentos
                </h3>

                {lessonDocs?.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No hay documentos
                  </p>
                ) : (
                  <div className="space-y-2">

                    {lessonDocs?.map((doc) => (
                      <div
                        key={doc.contentId}
                        className="flex justify-between items-center border p-3 rounded hover:bg-gray-100 transition"
                      >

                        {/* INFO */}
                        <div
                          className="cursor-pointer"
                          onClick={() =>
                            handleOpenDoc(doc.contentId)
                          }
                        >
                          <p className="font-medium">
                            {doc.content?.title || 'Sin título'}
                          </p>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex gap-2">

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/teacher/documents/edit/${doc.contentId}`
                              )
                            }
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <ConfirmDeleteButton
                            onConfirm={() =>
                              handleDeleteDoc(doc.contentId)
                            }
                          />

                        </div>
                      </div>
                    ))}

                  </div>
                )}

              </CardContent>
            </Card>
          )
        })
      )}

      {/* MODAL LECCIÓN */}
      <LessonFormDialog
        open={open}
        onClose={() => setOpen(false)}
        lesson={editingLesson}
        modules={modules}
        moduleId={parsedModuleId} // 🔥 CLAVE
      />

      {/* MODAL CONTENIDO */}
      <AddContentModal
        open={openContentModal}
        onClose={() => setOpenContentModal(false)}
        lessonId={selectedLessonId!}
        onSelect={handleSelectContentType}
      />

    </div>
  )
}
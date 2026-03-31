import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PlusCircle, Pencil, ArrowLeft, Image } from 'lucide-react'

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
import { useImageContents } from '@/hooks/useImageContents'
import { useModules } from '@/hooks/useModules'

import { LessonFormDialog } from '@/components/common/LessonFormDialog'
import { AddContentModal } from '@/components/common/AddContentModal'

import http from '@/lib/http'

// ✅ TIPOS
type Lesson = {
  id: number
  title: string
  description?: string
  moduleId: number
  order?: number
}

type DocumentItem = {
  contentId: number
  content: {
    lessonId: number
    title?: string
    order?: number
  }
}

type ImageItem = {
  contentId: number
  lessonId?: number
  imageUrl: string
  altText: string
  order?: number
  content?: {
    lessonId: number
  }
}

export function TeacherLessonsPage() {
  const navigate = useNavigate()
  const { moduleId } = useParams()

  const { useLessonsList, useDeleteLesson } = useLessons()
  const { data: lessons, isLoading, error } = useLessonsList()
  const deleteLesson = useDeleteLesson()

  const { useDocumentsList, useDeleteDocument } = useDocumentContents()
  const { data: documents } = useDocumentsList()
  const deleteDocument = useDeleteDocument()

  const { useImagesList, useDeleteImage } = useImageContents()
  const { data: images } = useImagesList()
  const deleteImage = useDeleteImage()

  const { data: modules } = useModules()

  const [open, setOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

  const [openContentModal, setOpenContentModal] = useState(false)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)

  const parsedModuleId = Number(moduleId)

  // ✅ FILTRAR LECCIONES
  const filteredLessons = (lessons as Lesson[] | undefined)
    ?.filter((l) => Number(l.moduleId) === parsedModuleId)
    ?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const handleOpenDoc = async (contentId: number) => {
    try {
      const res = await http.get(`/DocumentContents/GetSasUrl/${contentId}`)
      if (!res.data?.url) return alert('No se encontró el archivo')
      window.open(res.data.url, '_blank')
    } catch {
      alert('No se pudo abrir el documento')
    }
  }

  const handleDeleteDoc = (id: number) => {
    if (confirm('¿Eliminar documento?')) {
      deleteDocument.mutate(id)
    }
  }

  const handleDeleteImage = (id: number) => {
    if (confirm('¿Eliminar imagen?')) {
      deleteImage.mutate(id)
    }
  }

  const handleOpenImage = (url: string) => {
    window.open(url, '_blank')
  }

  const handleSelectContentType = (type: 'document' | 'image') => {
    if (!selectedLessonId) return

    if (type === 'document') {
      navigate(
        `/teacher/documents/upload?lessonId=${selectedLessonId}&moduleId=${parsedModuleId}`
      )
    }

    if (type === 'image') {
      navigate(
        `/teacher/images/upload?lessonId=${selectedLessonId}&moduleId=${parsedModuleId}`
      )
    }

    setOpenContentModal(false)
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error al cargar las lecciones ❌
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <Button
        variant="outline"
        onClick={() => navigate('/teacher/modules')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a módulos
      </Button>

      <PageHeader
        title="Lecciones del módulo"
        buttonText="Nueva Lección"
        icon={<PlusCircle className="w-4 h-4 mr-2" />}
        onClick={() => {
          setEditingLesson(null)
          setOpen(true)
        }}
      />

      {filteredLessons?.map((lesson) => {

        // 📄 DOCUMENTOS
        const lessonDocs: DocumentItem[] =
          (documents as DocumentItem[] | undefined)
            ?.filter((d) => d.content.lessonId === lesson.id)
            ?.sort((a, b) => (a.content?.order ?? 0) - (b.content?.order ?? 0)) ?? []

        // 🖼️ IMÁGENES (FIX REAL)
        const lessonImages: ImageItem[] =
          (images as ImageItem[] | undefined)
            ?.map((img) => ({
              ...img,
              lessonId: img.lessonId ?? img.content?.lessonId, // 🔥 NORMALIZA
            }))
            ?.filter((img) => img.lessonId === lesson.id)
            ?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) ?? []

        return (
          <Card key={lesson.id}>

            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>{lesson.title}</CardTitle>
                <p className="text-sm text-gray-500">
                  {lesson.description}
                </p>
              </div>

              <div className="flex gap-2">

                <Button
                  onClick={() => {
                    setSelectedLessonId(lesson.id)
                    setOpenContentModal(true)
                  }}
                >
                  <PlusCircle className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingLesson(lesson)
                    setOpen(true)
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                <ConfirmDeleteButton
                  onConfirm={() => deleteLesson.mutate(lesson.id)}
                />

              </div>
            </CardHeader>

            <CardContent className="space-y-4">

              {/* 📄 DOCUMENTOS */}
              <div>
                <h3 className="font-semibold mb-2">Documentos</h3>

                {lessonDocs.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No hay documentos
                  </p>
                ) : (
                  lessonDocs.map((doc) => (
                    <div
                      key={doc.contentId}
                      className="flex justify-between items-center border p-3 rounded"
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => handleOpenDoc(doc.contentId)}
                      >
                        {doc.content?.title}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/teacher/documents/edit/${doc.contentId}`)
                          }
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <ConfirmDeleteButton
                          onConfirm={() => handleDeleteDoc(doc.contentId)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 🖼️ IMÁGENES */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Imágenes
                </h3>

                {lessonImages.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No hay imágenes
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    {lessonImages.map((img) => (
                      <div
                        key={img.contentId}
                        className="border rounded p-2 space-y-2"
                      >
                        <img
                          src={img.imageUrl}
                          alt={img.altText}
                          className="w-full h-32 object-cover rounded cursor-pointer"
                          onClick={() => handleOpenImage(img.imageUrl)}
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://via.placeholder.com/150?text=Error'
                          }}
                        />

                        <p className="text-sm text-center">
                          {img.altText}
                        </p>

                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/teacher/images/edit/${img.contentId}`)
                            }
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <ConfirmDeleteButton
                            onConfirm={() =>
                              handleDeleteImage(img.contentId)
                            }
                          />
                        </div>
                      </div>
                    ))}

                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        )
      })}

      <LessonFormDialog
        open={open}
        onClose={() => setOpen(false)}
        lesson={editingLesson}
        modules={modules}
        moduleId={parsedModuleId}
      />

      <AddContentModal
        open={openContentModal}
        onClose={() => setOpenContentModal(false)}
        lessonId={selectedLessonId!}
        onSelect={handleSelectContentType}
      />

    </div>
  )
}
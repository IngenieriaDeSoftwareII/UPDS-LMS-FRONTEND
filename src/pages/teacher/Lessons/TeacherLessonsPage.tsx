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
import { useImageContents } from '@/hooks/useImageContents'
import { useModules } from '@/hooks/useModules'

import { LessonFormDialog } from '@/components/common/LessonFormDialog'
import { AddContentModal } from '@/components/common/AddContentModal'

import http from '@/lib/http'

// TIPOS
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
  content?: {
    lessonId: number
    order?: number
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

  // 🔥 NUEVO: control de toggle por lección
  const [openLessons, setOpenLessons] = useState<Record<number, boolean>>({})

  const toggleLesson = (lessonId: number) => {
    setOpenLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }))
  }

  const parsedModuleId = Number(moduleId)

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
    <div className="max-w-8xl mx-auto px-6 mt-8 space-y-4">

      <Button className='mt-4'
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

        const lessonDocs =
          (documents as DocumentItem[] | undefined)
            ?.filter((d) => d.content.lessonId === lesson.id) ?? []

        const lessonImages =
          (images as ImageItem[] | undefined)
            ?.map((img) => ({
              ...img,
              lessonId: img.lessonId ?? img.content?.lessonId,
            }))
            ?.filter((img) => img.lessonId === lesson.id) ?? []

        return (
          <Card key={lesson.id}>

            {/* 🔥 HEADER CLICKEABLE */}
            <CardHeader
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleLesson(lesson.id)}
            >
              <div>
                <CardTitle>{lesson.title}</CardTitle>
                <p className="text-sm text-gray-500">
                  {lesson.description}
                </p>
              </div>

              {/* 🔥 evitar que botones cierren */}
              <div
                className="flex gap-2"
                onClick={(e) => e.stopPropagation()}
              >

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

            {/* 🔥 TOGGLE (abierto por defecto) */}
            {openLessons[lesson.id] !== false && (
              <CardContent className="space-y-2">

                {(() => {

                  const combined = [
                    ...lessonDocs.map(doc => ({
                      type: 'document',
                      id: doc.contentId,
                      title: doc.content?.title || 'Documento',
                      order: doc.content?.order ?? 0,
                      data: doc
                    })),

                    ...lessonImages.map(img => ({
                      type: 'image',
                      id: img.contentId,
                      title: img.altText || 'Imagen',
                      order: img.content?.order ?? 0,
                      data: img
                    }))
                  ].sort((a, b) => a.order - b.order)

                  if (combined.length === 0) {
                    return (
                      <p className="text-gray-400 text-sm">
                        No hay contenido
                      </p>
                    )
                  }

                  return combined.map(item => {

                    if (item.type === 'document') {
                      const doc = item.data as DocumentItem

                      return (
                        <div
                          key={`doc-${item.id}`}
                          className="flex justify-between items-center border p-3 rounded hover:bg-gray-50"
                        >
                          <div
                            className="cursor-pointer flex items-center gap-2"
                            onClick={() => handleOpenDoc(doc.contentId)}
                          >
                            📄 {item.title}
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
                      )
                    }

                    const img = item.data as ImageItem

                    return (
                      <div
                        key={`img-${item.id}`}
                        className="border p-3 rounded space-y-2 hover:bg-gray-50"
                      >
                        <img
                          src={img.imageUrl}
                          alt={img.altText}
                          className="w-full max-h-64 object-contain rounded cursor-pointer"
                          onClick={() => handleOpenImage(img.imageUrl)}
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://via.placeholder.com/150?text=Error'
                          }}
                        />

                        <div className="flex justify-between items-center">
                          <p className="text-sm">{item.title}</p>

                          <div className="flex gap-2">
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
                      </div>
                    )
                  })

                })()}

              </CardContent>
            )}
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
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Pencil, Info,Trash2  } from 'lucide-react'

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
import { useDeleteModule } from '@/hooks/useModules'

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

  //  MÓDULOS
  const { data: modules } = useModules()
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)
  const deleteModule = useDeleteModule()

  //  LECCIONES
  const { useLessonsList, useDeleteLesson } = useLessons()
  const { data: lessons, isLoading, error } = useLessonsList()
  const deleteLesson = useDeleteLesson()

  //  DOCUMENTOS
  const { useDocumentsList, useDeleteDocument } = useDocumentContents()
  const { data: documents } = useDocumentsList()
  const deleteDocument = useDeleteDocument()

  // IMÁGENES
  const { useImagesList, useDeleteImage } = useImageContents()
  const { data: images } = useImagesList()
  const deleteImage = useDeleteImage()

  //  MODALES
  const [open, setOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

  const [openContentModal, setOpenContentModal] = useState(false)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)

  //  TOGGLE LECCIONES
  const [openLessons, setOpenLessons] = useState<Record<number, boolean>>({})

  const toggleLesson = (lessonId: number) => {
    setOpenLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }))
  }

  //  FILTRAR POR MÓDULO
  const filteredLessons = (lessons as Lesson[] | undefined)
    ?.filter(l => l.moduleId === selectedModuleId)
    ?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  //  DOCUMENTOS
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

  // IMÁGENES
  const handleDeleteImage = (id: number) => {
    if (confirm('¿Eliminar imagen?')) {
      deleteImage.mutate(id)
    }
  }

  const handleOpenImage = (url: string) => {
    window.open(url, '_blank')
  }

  // AGREGAR CONTENIDO
  const handleSelectContentType = (type: 'document' | 'image') => {
    if (!selectedLessonId) return

    if (type === 'document') {
      navigate(`/teacher/documents/upload?lessonId=${selectedLessonId}`)
    }

    if (type === 'image') {
      navigate(`/teacher/images/upload?lessonId=${selectedLessonId}`)
    }

    setOpenContentModal(false)
  }

  // LOADING
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  //  ERROR
  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error al cargar las lecciones ❌
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">

      {/*  HEADER */}
      <PageHeader
        title="Gestión de Lecciones"
        buttonText="Nueva Lección"
        icon={<PlusCircle className="w-4 h-4 mr-2" />}
        onClick={() => {
          setEditingLesson(null)
          setOpen(true)
        }}
      />

      {/*  SELECT MÓDULO */}
      <div className="max-w-md space-y-2">
        <label className="text-sm font-medium">Seleccionar módulo</label>

        <div className="flex gap-2">

          <select
            className="w-full border rounded-md p-2"
            value={selectedModuleId ?? ''}
            onChange={(e) =>
              setSelectedModuleId(Number(e.target.value))
            }
          >
            <option value="">Seleccione un módulo</option>

            {modules?.map(m => (
              <option key={m.id} value={m.id}>
                {m.titulo}
              </option>
            ))}
          </select>

          {/* ➕ CREAR */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/teacher/modules/create')}
          >
            <PlusCircle className="w-4 h-4" />
          </Button>

          {/* ✏️ EDITAR */}
          <Button
            variant="outline"
            size="icon"
            disabled={!selectedModuleId}
            onClick={() =>
              navigate(`/teacher/modules/edit/${selectedModuleId}`)
            }
          >
            <Pencil className="w-4 h-4" />
          </Button>

          {/* 🗑 ELIMINAR */}
          <Button
            variant="outline"
            size="icon"
            disabled={!selectedModuleId}
            onClick={() => {
              if (!selectedModuleId) return
              if (confirm('¿Eliminar módulo?')) {
                deleteModule.mutate(selectedModuleId)
                setSelectedModuleId(null)
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

        </div>
      </div>

      {/*  SIN MÓDULO */}
      {!selectedModuleId && (
        <div className="text-gray-500">
          Selecciona un módulo para ver sus lecciones 📚
        </div>
      )}

      {/*  LISTA */}
      {selectedModuleId && filteredLessons?.map((lesson) => {

        const lessonDocs =
          (documents as DocumentItem[] | undefined)
            ?.filter(d => d.content.lessonId === lesson.id) ?? []

        const lessonImages =
          (images as ImageItem[] | undefined)
            ?.map(img => ({
              ...img,
              lessonId: img.lessonId ?? img.content?.lessonId,
            }))
            ?.filter(img => img.lessonId === lesson.id) ?? []

        return (
          <Card key={lesson.id}>

            {/* HEADER */}
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
                  onClick={() => navigate(`/teacher/lessons/${lesson.id}`)}
                >
                  <Info className="w-4 h-4" />
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

            {/* CONTENIDO */}
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
                    return <p className="text-gray-400">No hay contenido</p>
                  }

                  return combined.map(item => {

                    if (item.type === 'document') {
                      const doc = item.data as DocumentItem

                      return (
                        <div
                          key={`doc-${item.id}`}
                          className="flex justify-between items-center border p-3 rounded"
                        >
                          <div
                            className="cursor-pointer"
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
                      <div key={`img-${item.id}`} className="border p-3 rounded">
                        <img
                          src={img.imageUrl}
                          className="w-full max-h-64 object-contain"
                          onClick={() => handleOpenImage(img.imageUrl)}
                        />

                        <div className="flex justify-between mt-2">
                          <p>{item.title}</p>

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

      {/* MODALES */}
      <LessonFormDialog
        open={open}
        onClose={() => setOpen(false)}
        lesson={editingLesson}
        modules={modules}
        moduleId={selectedModuleId}
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
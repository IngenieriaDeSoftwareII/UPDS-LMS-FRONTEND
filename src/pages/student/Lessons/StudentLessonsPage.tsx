import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, FileText, ChevronDown, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { useLessons } from '@/hooks/useLessons'
import { useDocumentContents } from '@/hooks/useDocumentContents'
import { useImageContents } from '@/hooks/useImageContents'

import http from '@/lib/http'

// TIPOS
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
  imageUrl: string
  altText: string
  content?: {
    lessonId: number
    order?: number
  }
}

export function StudentLessonsPage() {
  const navigate = useNavigate()
  const { moduleId } = useParams()

  const { useLessonsList } = useLessons()
  const { data: lessons, isLoading, error } = useLessonsList()

  const { useDocumentsList } = useDocumentContents()
  const { data: documents } = useDocumentsList()

  const { useImagesList } = useImageContents()
  const { data: images } = useImagesList()

  //  estado de lecciones abiertas
  const [openLessons, setOpenLessons] = useState<number[]>([])

  const parsedModuleId = Number(moduleId)

  const filteredLessons = lessons
    ?.filter((l) => Number(l.moduleId) === parsedModuleId)
    ?.sort((a, b) => Number(a.order || 0) - Number(b.order || 0))

  //  abrir todas SOLO una vez
  useEffect(() => {
    if (filteredLessons && openLessons.length === 0) {
      setOpenLessons(filteredLessons.map(l => l.id))
    }
  }, [filteredLessons])

  const handleOpenDoc = async (contentId: number) => {
    try {
      const res = await http.get(`/DocumentContents/GetSasUrl/${contentId}`)
      if (!res.data?.url) return alert('No se encontró el archivo')
      window.open(res.data.url, '_blank')
    } catch {
      alert('No se pudo abrir el documento')
    }
  }

  const handleOpenImage = (url: string) => {
    window.open(url, '_blank')
  }

  //  toggle múltiple
  const toggleLesson = (id: number) => {
    setOpenLessons(prev =>
      prev.includes(id)
        ? prev.filter(l => l !== id)
        : [...prev, id]
    )
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

      <Button
        variant="outline"
        onClick={() => navigate('/student/modules')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a módulos
      </Button>

      <h1 className="text-2xl font-bold">
        Lecciones del módulo
      </h1>

      {filteredLessons?.map((lesson) => {

        const isOpen = openLessons.includes(lesson.id)

        const lessonDocs =
          (documents as DocumentItem[] | undefined)
            ?.filter((d) => d.content.lessonId === lesson.id) ?? []

        const lessonImages =
          (images as ImageItem[] | undefined)
            ?.map((img) => ({
              ...img,
              lessonId: img.content?.lessonId,
            }))
            ?.filter((img) => img.lessonId === lesson.id) ?? []

        const combined = [
          ...lessonDocs.map(doc => ({
            type: 'document' as const,
            id: doc.contentId,
            title: doc.content?.title || 'Documento',
            order: doc.content?.order ?? 0,
            data: doc
          })),

          ...lessonImages.map(img => ({
            type: 'image' as const,
            id: img.contentId,
            order: img.content?.order ?? 0,
            data: img
          }))
        ].sort((a, b) => a.order - b.order)

        return (
          <Card key={lesson.id}>

            {/* HEADER */}
            <CardHeader
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => toggleLesson(lesson.id)}
            >
              <div className="flex justify-between items-center">

                <div>
                  <CardTitle className="text-base">
                    {lesson.title}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {lesson.description || 'Sin descripción'}
                  </p>
                </div>

                {isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </CardHeader>

            {/* CONTENIDO */}
            {isOpen && (
              <CardContent className="space-y-3">

                {combined.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No hay contenido
                  </p>
                ) : (
                  combined.map(item => {

                    if (item.type === 'document') {
                      return (
                        <div
                          key={`doc-${item.id}`}
                          className="flex items-center gap-2 py-2 px-2 hover:bg-gray-100 rounded cursor-pointer"
                          onClick={() => handleOpenDoc(item.id)}
                        >
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                        </div>
                      )
                    }

                    const img = item.data as ImageItem

                    return (
                      <img
                        key={`img-${item.id}`}
                        src={img.imageUrl}
                        alt={img.altText}
                        className="w-full max-h-80 object-contain cursor-pointer"
                        onClick={() => handleOpenImage(img.imageUrl)}
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://via.placeholder.com/150?text=Error'
                        }}
                      />
                    )
                  })
                )}

              </CardContent>
            )}

          </Card>
        )
      })}

    </div>
  )
}
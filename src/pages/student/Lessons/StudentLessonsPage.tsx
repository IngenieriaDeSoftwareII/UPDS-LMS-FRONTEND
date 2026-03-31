import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

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

import http from '@/lib/http'

export function StudentLessonsPage() {
  const navigate = useNavigate()
  const { moduleId } = useParams()

  // 🔹 lessons
  const { useLessonsList } = useLessons()
  const { data: lessons, isLoading, error } = useLessonsList()

  // 🔹 documents
  const { useDocumentsList } = useDocumentContents()
  const { data: documents } = useDocumentsList()

  // 🔥 validar moduleId
  const parsedModuleId = Number(moduleId)

  // 🔥 FILTRAR + ORDENAR LECCIONES
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
        onClick={() => navigate('/student/modules')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a módulos
      </Button>

      {/* HEADER */}
      <h1 className="text-2xl font-bold">
        Lecciones del módulo
      </h1>

      {/* LISTA */}
      {filteredLessons?.length === 0 ? (
        <p className="text-gray-500">
          No hay lecciones en este módulo
        </p>
      ) : (
        filteredLessons?.map((lesson) => {

          // 🔥 DOCUMENTOS ORDENADOS
          const lessonDocs = documents
            ?.filter((d) => d.content.lessonId === lesson.id)
            ?.sort(
              (a, b) =>
                (a.content?.order || 0) - (b.content?.order || 0)
            )

          return (
            <Card key={lesson.id}>

              {/* HEADER */}
              <CardHeader>
                <div>
                  <CardTitle>{lesson.title}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {lesson.description || 'Sin descripción'}
                  </p>
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
                        className="flex justify-between items-center border p-3 rounded hover:bg-gray-100 transition cursor-pointer"
                        onClick={() =>
                          handleOpenDoc(doc.contentId)
                        }
                      >
                        <p className="font-medium">
                          {doc.content?.title || 'Sin título'}
                        </p>
                      </div>
                    ))}

                  </div>
                )}

              </CardContent>
            </Card>
          )
        })
      )}

    </div>
  )
}
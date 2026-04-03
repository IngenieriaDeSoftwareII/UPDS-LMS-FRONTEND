import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDocumentContents } from '@/hooks/useDocumentContents'
import { useLessons } from '@/hooks/useLessons'
import { DocumentsTable } from '@/components/DocumentsTable'

export function LessonDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { useDocumentsList } = useDocumentContents()
  const { data: documents } = useDocumentsList()

  const { useLessonsList } = useLessons()
  const { data: lessons } = useLessonsList()

  const lesson = lessons?.find(l => l.id === Number(id))

  const lessonDocs = documents?.filter(
    d => d.content.lessonId === Number(id)
  )

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        className="mb-4"
        onClick={() => {
          if (lesson?.moduleId) {
            navigate(`/teacher/modules/${lesson.moduleId}/lessons`)
          } else {
            navigate(-1)
          }
        }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Lecciones
      </Button>

      {/* 🔹 Información de la lección */}
      <div className="bg-white p-6 rounded-2xl shadow border space-y-4">

        <div className="grid grid-cols-3 gap-4">

          <div>
            <p className="text-sm text-gray-400">TÍTULO</p>
            <p className="font-semibold">{lesson?.title}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">DESCRIPCIÓN</p>
            <p>{lesson?.description}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">ORDEN</p>
            <p>{lesson?.order}</p>
          </div>

        </div>

      </div>

      {/* 🔹 Tabla de documentos */}
      <div>
        <h2 className="text-lg font-semibold mb-2">
          📄 Documentos de la lección
        </h2>

        <DocumentsTable documents={lessonDocs || []} />
      </div>

    </div>
  )
}
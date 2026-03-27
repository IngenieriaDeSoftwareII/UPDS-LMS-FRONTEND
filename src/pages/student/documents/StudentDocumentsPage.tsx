import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDocumentContents } from '@/hooks/useDocumentContents'
import { useLessons } from '@/hooks/useLessons'
import { Eye, Download, FileText } from 'lucide-react'

export function StudentDocumentsPage() {

  // 📚 DOCUMENTOS
  const { useDocumentsList } = useDocumentContents()
  const { data: documents, isLoading, isError } = useDocumentsList()

  // 📘 LECCIONES
  const { useLessonsList } = useLessons()
  const { data: lessons } = useLessonsList()

  // 👁 VER
  const handleView = async (id: number) => {
    try {
      const res = await fetch(
        `http://localhost:5024/api/DocumentContents/GetSasUrl/${id}`
      )

      const data = await res.json()

      if (!data?.url) {
        alert('No se encontró el archivo')
        return
      }

      window.open(data.url, '_blank', 'noopener,noreferrer')

    } catch (error) {
      console.error(error)
      alert('Error al abrir documento')
    }
  }

  // ⬇ DESCARGAR
  const handleDownload = async (id: number) => {
    try {
      const res = await fetch(
        `http://localhost:5024/api/DocumentContents/GetSasUrl/${id}`
      )

      const data = await res.json()

      if (!data?.url) {
        alert('No se pudo descargar')
        return
      }

      const link = document.createElement('a')
      link.href = data.url
      link.setAttribute('download', '')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (error) {
      console.error(error)
      alert('Error al descargar')
    }
  }

  // ⏳ ESTADOS
  if (isLoading) return <p>Cargando...</p>
  if (isError) return <p>Error al cargar</p>

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Mis Lecciones</h1>

      {lessons?.map((lesson: any) => {

        // 🔥 DOCUMENTOS DE ESA LECCIÓN
        const lessonDocs = documents
          ?.filter((d: any) => d.content.lessonId === lesson.id)
          ?.sort((a: any, b: any) =>
            (a.content?.order || 0) - (b.content?.order || 0)
          )

        return (
          <Card key={lesson.id}>

            {/* HEADER */}
            <CardHeader>
              <CardTitle>{lesson.title}</CardTitle>
              <p className="text-sm text-gray-500">
                {lesson.description}
              </p>
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

                  {lessonDocs?.map((doc: any) => (
                    <div
                      key={doc.contentId}
                      className="flex justify-between items-center border p-3 rounded"
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

                        {/* 👁 VER (AZUL) */}
                        <Button
                          size="icon"
                          onClick={() => handleView(doc.contentId)}
                        >
                          <Eye size={16} />
                        </Button>

                        {/* ⬇ DESCARGAR (AZUL) */}
                        <Button
                          size="icon"
                          onClick={() => handleDownload(doc.contentId)}
                        >
                          <Download size={16} />
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

    </div>
  )
}
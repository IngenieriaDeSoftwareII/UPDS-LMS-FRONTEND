
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDocumentContents } from '@/hooks/useDocumentContents'
import { Eye, Download } from 'lucide-react'

export function StudentDocumentsPage() {
  const { useDocumentsList } = useDocumentContents()
  const { data, isLoading, isError } = useDocumentsList()

  // 👁 VER DOCUMENTO (abre en otra pestaña)
  const handleView = async (id: number) => {
    try {
      const res = await fetch(
        `http://localhost:5024/api/DocumentContents/GetSasUrl/${id}`
      )

      const result = await res.json()

      if (!result?.url) {
        alert('No se pudo abrir el documento')
        return
      }

      window.open(result.url, '_blank')
    } catch (error) {
      console.error(error)
      alert('Error al abrir documento')
    }
  }

  // ⬇ DESCARGAR DOCUMENTO (SOLUCIÓN SIN CORS)
  const handleDownload = async (
    id: number,
    title?: string,
    format?: string
  ) => {
    try {
      const res = await fetch(
        `http://localhost:5024/api/DocumentContents/GetSasUrl/${id}`
      )

      const result = await res.json()

      if (!result?.url) {
        alert('No se pudo descargar el documento')
        return
      }

      // 🔥 descarga directa (SIN fetch al archivo)
      const a = document.createElement('a')
      a.href = result.url

      // nombre del archivo
      const fileName = `${title || 'documento'}.${format || 'pdf'}`
      a.setAttribute('download', fileName)

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

    } catch (error) {
      console.error(error)
      alert('Error al descargar documento')
    }
  }

  if (isLoading) return <p>Cargando...</p>
  if (isError) return <p>Error al cargar documentos</p>

  return (
    <div className="space-y-4">

      <h2 className="text-xl font-bold">
        Material de la Clase
      </h2>

      {data?.length === 0 && (
        <p>No hay documentos disponibles</p>
      )}

      {data?.map((doc) => (
        <Card key={doc.contentId}>
          <CardContent className="flex justify-between items-center p-4">

            {/* INFO */}
            <div>
              <p className="font-semibold">
                {doc.content?.title}
              </p>

              <p className="text-sm text-gray-500">
                {doc.format} • {doc.pageCount ?? 0} páginas
              </p>
            </div>

            {/* BOTONES */}
            <div className="flex gap-2">

              {/* 👁 VER */}
              <Button
                onClick={() => handleView(doc.contentId)}
                title="Ver documento"
              >
                <Eye size={16} />
              </Button>

              {/* ⬇ DESCARGAR */}
              <Button
                onClick={() =>
                  handleDownload(
                    doc.contentId,
                    doc.content?.title,
                    doc.format
                  )
                }
                title="Descargar documento"
              >
                <Download size={16} />
              </Button>

            </div>

          </CardContent>
        </Card>
      ))}
    </div>
  )
}
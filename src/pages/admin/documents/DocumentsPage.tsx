import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocumentContents } from '@/hooks/useDocumentContents'

export function DocumentsPage() {
  const navigate = useNavigate()

  const { useDocumentsList, useDeleteDocument } = useDocumentContents()
  const { data, isLoading, error } = useDocumentsList()
  const { mutate: deleteDocument } = useDeleteDocument()

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      deleteDocument(id)
    }
  }

  const handleOpen = async (contentId: number) => {
    console.log('🔵 ID:', contentId)

    try {
      const res = await fetch(
        `http://localhost:5024/api/DocumentContents/GetSasUrl/${contentId}`
      )

      if (!res.ok) {
        const text = await res.text()
        console.error('🔴 BACKEND ERROR:', text)
        alert('Error backend: ' + text)
        return
      }

      const data = await res.json()

      console.log('🟢 SAS URL:', data)

      if (!data?.url) {
        alert('No se recibió URL válida')
        return
      }

      window.open(data.url, '_blank')
    } catch (err) {
      console.error('🔴 ERROR COMPLETO:', err)
      alert('No se pudo abrir el documento')
    }
  }

  return (
    <div className="space-y-6">

      {/* 🔥 BOTÓN CORREGIDO */}
      <div className="flex justify-end">
        <Button onClick={() => navigate('/uploaddocuments')}>
          + Subir Documento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentos Subidos</CardTitle>
        </CardHeader>

        <CardContent>
          {error ? (
            <p className="text-red-500">Error al cargar documentos</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Tamaño (KB)</TableHead>
                  <TableHead>Páginas</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ) : data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No hay documentos
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.map((doc) => (
                    <TableRow key={doc.contentId}>
                      <TableCell>{doc.contentId}</TableCell>

                      <TableCell>
                        {doc.fileUrl || 'Sin archivo'}
                      </TableCell>

                      <TableCell>{doc.format}</TableCell>
                      <TableCell>{doc.sizeKb}</TableCell>
                      <TableCell>{doc.pageCount}</TableCell>

                      <TableCell className="flex gap-2">
                        <Button onClick={() => handleOpen(doc.contentId)}>
                          Ver
                        </Button>

                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(doc.contentId)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
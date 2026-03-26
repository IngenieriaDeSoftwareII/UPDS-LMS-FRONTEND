import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocumentContents } from '@/hooks/useDocumentContents'

export function DocumentsPage() {
  const { useDocumentsList, useDeleteDocument } = useDocumentContents()

  const { data, isLoading, error } = useDocumentsList()
  const { mutate: deleteDocument } = useDeleteDocument()

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      deleteDocument(id)
    }
  }

  const handleOpen = (url?: string) => {
    if (!url) return
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6">

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

                      {/* Nombre del archivo */}
                      <TableCell>
                        {doc.fileUrl ? doc.fileUrl.split('/').pop() : 'Sin archivo'}
                      </TableCell>

                      <TableCell>{doc.format}</TableCell>
                      <TableCell>{doc.sizeKb}</TableCell>
                      <TableCell>{doc.pageCount}</TableCell>

                      <TableCell className="flex gap-2">
                        {/* Abrir */}
                        <Button onClick={() => handleOpen(doc.fileUrl)}>Ver</Button>

                        {/* Eliminar */}
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
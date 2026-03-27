import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useDocumentContents } from '@/hooks/useDocumentContents'

export function DocumentsTable({ documents }: any) {
  const { useDeleteDocument } = useDocumentContents()
  const deleteDocument = useDeleteDocument()

  const handleOpen = async (id: number) => {
    try {
      const res = await fetch(
        `http://localhost:5024/api/DocumentContents/GetSasUrl/${id}`
      )
      const data = await res.json()
      window.open(data.url, '_blank')
    } catch {
      alert('No se pudo abrir')
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Título</TableHead>
          <TableHead>Orden</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {documents.map((doc: any) => (
          <TableRow key={doc.contentId}>

            <TableCell>{doc.contentId}</TableCell>

            {/* 🔥 FIX DEL TÍTULO */}
            <TableCell className="font-medium">
              {doc.content?.title || doc.title || doc.fileName || 'Sin título'}
            </TableCell>

            <TableCell>
              {doc.content?.order ?? '—'}
            </TableCell>

            <TableCell className="flex gap-2">

              <Button onClick={() => handleOpen(doc.contentId)}>
                Ver
              </Button>

              <Button
                variant="destructive"
                onClick={() => deleteDocument.mutate(doc.contentId)}
              >
                Eliminar
              </Button>

            </TableCell>

          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
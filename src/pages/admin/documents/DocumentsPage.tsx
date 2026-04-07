import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

import { useDocumentContents } from '@/hooks/useDocumentContents'
import { useLessons } from '@/hooks/useLessons'
import { useModules } from '@/hooks/useModules'
import { useCoursesPrueba } from '@/hooks/useCoursesPrueba'

export function DocumentsPage() {
  const navigate = useNavigate()

  const { useDocumentsList, useDeleteDocument } = useDocumentContents()
  const { data, isLoading, error } = useDocumentsList()
  const { mutate: deleteDocument } = useDeleteDocument()

  // RELACIONES
  const { useLessonsList } = useLessons()
  const { data: lessons } = useLessonsList()

  const { data: modules } = useModules()
  const { data: courses } = useCoursesPrueba()

  //  HELPER PRO
  const getFullPath = (lessonId?: number) => {
    if (!lessonId) return '—'

    const lesson = lessons?.find(l => l.id === lessonId)
    if (!lesson) return '—'

    const module = modules?.find(m => m.id === lesson.moduleId)
    const course = courses?.find(c => c.id === module?.cursoId)

    return `Curso: ${course?.titulo || '—'} • Módulo: ${module?.titulo || '—'} • Lección: ${lesson.title}`
  }

  const handleDelete = (contentId: number) => {
    if (window.confirm('¿Eliminar documento?')) {
      deleteDocument(contentId)
    }
  }

  const handleOpen = async (contentId: number) => {
    try {
      const res = await fetch(
        `http://localhost:5024/api/DocumentContents/GetSasUrl/${contentId}`
      )

      if (!res.ok) {
        const text = await res.text()
        alert('Error backend: ' + text)
        return
      }

      const data = await res.json()

      if (!data?.url) {
        alert('No se recibió URL válida')
        return
      }

      window.open(data.url, '_blank')
    } catch {
      alert('No se pudo abrir el documento')
    }
  }

  return (
    <div className="space-y-6">

      {/* BOTÓN SUBIR */}
      <div className="flex justify-end">
        <Button onClick={() => navigate('/admin/documents/upload')}>
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
                  <TableHead>ID Doc</TableHead>
                  <TableHead>ID Content</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Curso / Módulo / Lección</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Tamaño (KB)</TableHead>
                  <TableHead>Páginas</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ) : data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">
                      No hay documentos
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.map((doc) => (
                    <TableRow key={doc.contentId}>

                      <TableCell>{doc.contentId}</TableCell>

                      <TableCell>{doc.content?.id ?? '—'}</TableCell>

                      <TableCell>
                        {doc.content?.title || 'Sin título'}
                      </TableCell>

                      {/*  NUEVO */}
                      <TableCell>
                        {getFullPath(doc.content?.lessonId)}
                      </TableCell>

                      <TableCell>
                        {doc.content?.order ?? '—'}
                      </TableCell>

                      <TableCell>
                        {doc.fileUrl || 'Sin archivo'}
                      </TableCell>

                      <TableCell>{doc.format}</TableCell>

                      <TableCell>
                        {doc.sizeKb ? `${doc.sizeKb} KB` : '—'}
                      </TableCell>

                      <TableCell>
                        {doc.pageCount ?? '—'}
                      </TableCell>

                      <TableCell className="flex justify-end gap-2">

                        <Button
                          variant="ghost"
                          title="Ver documento"
                          onClick={() => handleOpen(doc.contentId)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar"
                          onClick={() =>
                            navigate(`/admin/documents/edit/${doc.contentId}`)
                          }
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar"
                          onClick={() => handleDelete(doc.contentId)}
                        >
                          <Trash2 className="w-4 h-4" />
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
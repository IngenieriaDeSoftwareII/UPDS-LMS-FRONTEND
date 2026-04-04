import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

import { useImageContents } from '@/hooks/useImageContents'
import { useLessons } from '@/hooks/useLessons'

// 👇 opcional: usa tu tipo real si lo tienes
type Lesson = {
  id: number
  title: string
}

export function ImagesPage() {
  const navigate = useNavigate()

  const { useImagesList, useDeleteImage } = useImageContents()
  const { useLessonsList } = useLessons()

  // ✅ FIX: evitar undefined
  const { data = [], isLoading } = useImagesList()
  const { data: lessons = [] } = useLessonsList()

  const { mutate: deleteImage } = useDeleteImage()

  // ✅ MAPA TIPADO
  const lessonsMap: Record<number, Lesson> = Object.fromEntries(
    lessons.map((l: Lesson) => [l.id, l])
  )

  const handleDelete = (id: number) => {
    if (confirm('¿Eliminar imagen?')) {
      deleteImage(id)
    }
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Gestión de Imágenes</h2>

        <Button onClick={() => navigate('/admin/images/upload')}>
          + Subir Imagen
        </Button>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Imágenes</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Lección</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Imagen</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No hay imágenes registradas
                  </TableCell>
                </TableRow>
              ) : (
                data.map((img: any) => {
                  const lesson = lessonsMap[img.content?.lessonId]

                  return (
                    <TableRow key={img.contentId}>

                      {/* ID */}
                      <TableCell>{img.contentId}</TableCell>

                      {/* LECCIÓN */}
                      <TableCell>
                        {lesson ? (
                          <div className="flex flex-col">
                            <span>{lesson.title}</span>
                            <span className="text-xs text-muted-foreground">
                              ID: {lesson.id}
                            </span>
                          </div>
                        ) : '—'}
                      </TableCell>

                      {/* TÍTULO */}
                      <TableCell>
                        {img.content?.title ?? img.altText}
                      </TableCell>

                      {/* IMAGEN */}
                      <TableCell>
                        <img
                          src={img.imageUrl}
                          alt={img.altText}
                          className="w-20 h-20 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://via.placeholder.com/80?text=Error'
                          }}
                        />
                      </TableCell>

                      {/* FORMATO */}
                      <TableCell>{img.format}</TableCell>

                      {/* TAMAÑO */}
                      <TableCell>
                        {img.sizeKb ? `${img.sizeKb} KB` : '—'}
                      </TableCell>

                      {/* ORDEN */}
                      <TableCell>
                        {img.content?.order ?? '—'}
                      </TableCell>

                      {/* ACCIONES */}
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar"
                          onClick={() =>
                            navigate(`/admin/images/edit/${img.contentId}`)
                          }
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar"
                          onClick={() => handleDelete(img.contentId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>

                    </TableRow>
                  )
                })
              )}
            </TableBody>

          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
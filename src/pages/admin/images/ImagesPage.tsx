import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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

export function ImagesPage() {
  const navigate = useNavigate()

  const { useImagesList, useDeleteImage } = useImageContents()

  const { data, isLoading } = useImagesList()
  const { mutate: deleteImage } = useDeleteImage()

  const handleDelete = (id: number) => {
    if (confirm('¿Eliminar imagen?')) {
      deleteImage(id)
    }
  }

  return (
    <div className="space-y-6">

      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Gestión de Imágenes</h2>

        <Button onClick={() => navigate('/admin/uploadimage')}>
          + Subir Imagen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Imágenes</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Lesson</TableHead> {/* 🔥 NUEVO */}
                <TableHead>Título</TableHead>
                <TableHead>Imagen</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Orden</TableHead> {/* 🔥 NUEVO */}
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
              ) : data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No hay imágenes registradas
                  </TableCell>
                </TableRow>
              ) : (
                data?.map((img: any) => (
                  <TableRow key={img.contentId}>

                    {/* ID */}
                    <TableCell>{img.contentId}</TableCell>

                    {/* 🔥 LESSON ID */}
                    <TableCell>
                      {img.content?.lessonId ?? '—'}
                    </TableCell>

                    {/* 🔥 TÍTULO REAL DESDE CONTENT */}
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

                    {/* 🔥 ORDEN */}
                    <TableCell>
                      {img.content?.order ?? '—'}
                    </TableCell>

                    <TableCell className="text-right space-x-2">

                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate(`/admin/images/edit/${img.contentId}`)
                        }
                      >
                        Editar
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(img.contentId)}
                      >
                        Eliminar
                      </Button>

                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>

          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { imageContentService } from '@/services/imageContent.service'

export const useImageContents = () => {
  const qc = useQueryClient()

  const useImagesList = () =>
    useQuery({
      queryKey: ['images'],
      queryFn: imageContentService.getAll,
    })

  const useUploadImage = () =>
    useMutation({
      mutationFn: (formData: FormData) =>
        imageContentService.upload(formData),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['images'] })
      },
    })

  const useDeleteImage = () =>
    useMutation({
      mutationFn: (id: number) =>
        imageContentService.delete(id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['images'] })
      },
    })

    const useUpdateImage = () =>
    useMutation({
        mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
        imageContentService.update(id, formData),

        onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['images'] })
        },

        onError: (err: any) => {
        console.error('Error al actualizar imagen:', err)
        },
    })

  return {
    useImagesList,
    useUploadImage,
    useDeleteImage,
    useUpdateImage,
  }
}
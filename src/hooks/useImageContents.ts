import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { imageContentService } from '@/services/imageContent.service'

export const useImageContents = () => {
  const qc = useQueryClient()

  // LIST
  const useImagesList = () =>
    useQuery({
      queryKey: ['images'],
      queryFn: imageContentService.getAll,
    })

  // UPLOAD
  const useUploadImage = () =>
    useMutation({
      mutationFn: imageContentService.upload,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['images'] })
      },
    })

  // DELETE
  const useDeleteImage = () =>
    useMutation({
      mutationFn: imageContentService.delete,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['images'] })
      },
    })

  //  UPDATE 
  const useUpdateImage = () =>
    useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
        imageContentService.update(id, formData),

      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['images'] })
      },
    })

  return {
    useImagesList,
    useUploadImage,
    useDeleteImage,
    useUpdateImage,
  }
}
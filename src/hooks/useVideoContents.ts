import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { videoContentService } from '@/services/videoContent.service'

export const useVideoContents = () => {
  const qc = useQueryClient()

  const useVideosList = () =>
    useQuery({
      queryKey: ['videos'],
      queryFn: videoContentService.getAll,
    })

  const useUploadVideo = () =>
    useMutation({
      mutationFn: videoContentService.upload,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['videos'] })
      },
    })

  const useDeleteVideo = () =>
    useMutation({
      mutationFn: videoContentService.delete,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['videos'] })
      },
    })

  const useUpdateVideo = () =>
    useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
        videoContentService.update(id, formData),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['videos'] })
      },
    })
    

  return {
    useVideosList,
    useUploadVideo,
    useDeleteVideo,
    useUpdateVideo,
  }
}
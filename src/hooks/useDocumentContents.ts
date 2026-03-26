import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { documentContentsService } from '@/services/documentContents.service'
import type { UploadDocumentDto } from '@/services/documentContents.service'

export const useDocumentContents = () => {
  const queryClient = useQueryClient()

  const useDocumentsList = () =>
    useQuery({
      queryKey: ['documents'],
      queryFn: documentContentsService.getAll,
    })

  const useUploadDocument = () =>
    useMutation({
      mutationFn: (data: UploadDocumentDto) =>
        documentContentsService.upload(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['documents'] })
      },
    })

  const useDeleteDocument = () =>
    useMutation({
      mutationFn: (id: number) =>
        documentContentsService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['documents'] })
      },
    })

  return {
    useDocumentsList,
    useUploadDocument,
    useDeleteDocument,
  }
}
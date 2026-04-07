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
  const useUpdateDocument = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number, data: FormData | { title: string, order: number, pageCount?: number, lessonId: number } }) =>
        documentContentsService.update(id, data),
    })
  }

  const useDocumentById = (id: number) =>
  useQuery({
    queryKey: ['document', id],
    queryFn: () => documentContentsService.getById(id),
    enabled: !!id,
  })
  return {
    useDocumentsList,
    useUploadDocument,
    useDeleteDocument,
    useUpdateDocument,
    useDocumentById
  }
}
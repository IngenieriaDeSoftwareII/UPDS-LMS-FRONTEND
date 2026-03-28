import { useCrud } from './useCrud'

export interface Content {
  id: number
  lessonId: number
  type: string
  title?: string
  order: number
  entityStatus: number
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface ContentDto {
  id?: number
  lessonId: number
  type: number
  title?: string
  order: number
}

export const useContents = () => {
  const crud = useCrud<ContentDto, ContentDto, Content>('Contents')

  return {
    useContentsList: crud.useList,
    useCreateContent: crud.useCreate,
    useUpdateContent: crud.useUpdate,
    useDeleteContent: crud.useDelete,
  }
}
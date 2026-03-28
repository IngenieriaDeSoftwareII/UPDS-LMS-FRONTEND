import { createService } from './base.service'

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
  lessonId: number
  type: number // 🔥 enum (int)
  title?: string
  order: number
}

export const contentsService = createService<
  ContentDto,
  ContentDto,
  Content
>('Contents')
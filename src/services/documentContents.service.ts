import http from '@/lib/http'

// 🔥 DTO response
export interface DocumentContent {
  contentId: number
  fileUrl: string
  format: string
  sizeKb?: number
  pageCount?: number

  content: {
    id: number
    lessonId: number
    type: string
    order: number
    entityStatus: number
    createdAt: string
    updatedAt: string
    deletedAt?: string
  }
}

// 🔥 DTO upload
export interface UploadDocumentDto {
  file: File
  lessonId: number
  format?: string
  pageCount?: number
}

export const documentContentsService = {

  // 🔥 GET ALL
  getAll: () =>
    http.get<DocumentContent[]>('/DocumentContents/GetAll')
      .then(r => r.data),

  // 🔥 DELETE
  delete: (id: number) =>
    http.delete(`/DocumentContents/Delete/${id}`),

  // 🔥 UPLOAD FILE (FORMDATA)
  upload: (data: UploadDocumentDto) => {
    const formData = new FormData()

    formData.append('File', data.file)
    formData.append('LessonId', String(data.lessonId))

    if (data.format) formData.append('Format', data.format)
    if (data.pageCount) formData.append('PageCount', String(data.pageCount))

    return http.post('/DocumentContents/Upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
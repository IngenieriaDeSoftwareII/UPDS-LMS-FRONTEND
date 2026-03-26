import http from '@/lib/http'

// 🔥 DTO response
export interface DocumentContent {
  contentId: number
  fileUrl: string
  format: string
  sizeKb?: number
  pageCount?: number
}

// 🔥 DTO upload
export interface UploadDocumentDto {
  file: File
  lessonId: number
  title?: string
  format?: string
  sizeKb?: number
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

    if (data.title) formData.append('Title', data.title)
    if (data.format) formData.append('Format', data.format)
    if (data.sizeKb) formData.append('SizeKb', String(data.sizeKb))
    if (data.pageCount) formData.append('PageCount', String(data.pageCount))

    return http.post('/DocumentContents/Upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
import http from '@/lib/http'

// DTO response
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
    title: string 
    order: number
    entityStatus: number
    createdAt: string
    updatedAt: string
    deletedAt?: string
  }
}

// DTO upload
export interface UploadDocumentDto {
  file: File
  lessonId: number
  title: string
  format?: string
  pageCount?: number
  order: number
}

export const documentContentsService = {

  // GET ALL
  getAll: () =>
    http.get<DocumentContent[]>('/DocumentContents/GetAll')
      .then(r => r.data),

  // DELETE
  delete: (id: number) =>
    http.delete(`/DocumentContents/Delete/${id}`),

  // UPLOAD FILE (FORMDATA)
  upload: (data: UploadDocumentDto) => {
    const formData = new FormData()

    formData.append('File', data.file)
    formData.append('LessonId', String(data.lessonId))
    formData.append('Title', data.title)
    formData.append('Order', String(data.order))

    if (data.format) formData.append('Format', data.format)
    if (data.pageCount) formData.append('PageCount', String(data.pageCount))

    return http.post('/DocumentContents/Upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  //UPDATE
  update: (id: number, data: FormData | { title: string; order: number; pageCount?: number }) => {
    if (data instanceof FormData) {
      return http.put(`/DocumentContents/UpdateFile/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } else {
      return http.put(`/DocumentContents/Update/${id}`, data)
    }
  },
  //Para cargar
  getById: (id: number) =>
  http.get(`/DocumentContents/${id}`)
    .then(r => r.data),
}
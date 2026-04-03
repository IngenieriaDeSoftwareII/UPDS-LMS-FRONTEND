import http from '@/lib/http'
export interface ImageContent {
  contentId: number
  imageUrl: string
  format: string
  sizeKb?: number
  altText: string

  content: {
    id: number
    lessonId: number
    title: string
    order: number
  }
}
export const imageContentService = {
  getAll: () =>
    http.get('/ImageContents/GetAll').then(r => r.data),

  upload: (data: FormData) =>
    http.post('/ImageContents/Upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: number, formData: FormData) => {
    console.log('🚀 SENDING UPDATE REQUEST ID:', id)

    return http.put(`/ImageContents/Update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  delete: (id: number) =>
    http.delete(`/ImageContents/Delete/${id}`),
}
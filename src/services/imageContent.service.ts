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

const BASE = '/ImageContents'

export const imageContentService = {
  //  GET ALL
  getAll: async (): Promise<ImageContent[]> => {
    const res = await http.get(`${BASE}/GetAll`)
    return res.data
  },

  // UPLOAD
  upload: async (data: FormData) => {
    const res = await http.post(`${BASE}/Upload`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  //  UPDATE
  update: async (id: number, formData: FormData) => {
    const res = await http.put(`${BASE}/Update/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  //  DELETE
  delete: async (id: number) => {
    const res = await http.delete(`${BASE}/Delete/${id}`)
    return res.data
  },
}
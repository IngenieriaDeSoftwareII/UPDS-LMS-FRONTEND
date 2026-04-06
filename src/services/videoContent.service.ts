import http from '@/lib/http'

export interface VideoContent {
  contentId: number
  videoUrl: string
  duracionSeg: number

  content: {
    id: number
    lessonId: number
    title: string
    order: number
  }
}

const BASE = '/VideoContents'

export const videoContentService = {
    // GET ALL
    getAll: async (): Promise<VideoContent[]> => {
    const res = await http.get(`${BASE}/GetAll`)

    return res.data.map((v: any) => ({
        ...v,
        videoUrl: v.urlVideo, 
    }))
    },

  // UPLOAD
  upload: async (data: FormData) => {
    const res = await http.post(`${BASE}/Upload`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  // UPDATE
  update: async (id: number, formData: FormData) => {
    const res = await http.put(`${BASE}/Update/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  // DELETE
  delete: async (id: number) => {
    const res = await http.delete(`${BASE}/Delete/${id}`)
    return res.data
  },
}
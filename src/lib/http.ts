import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5024/api'

const http = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default http

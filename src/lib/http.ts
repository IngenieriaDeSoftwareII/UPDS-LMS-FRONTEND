import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/auth.store'
import type { AuthResponse } from '@/types/auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5024/api'

const http = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request: adjuntar access token ──────────────────────────────────────────

http.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Response: manejar expiración de sesión ───────────────────────────────────

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean }

let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function flushQueue(err: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) =>
    err ? reject(err) : resolve(token!),
  )
  pendingQueue = []
}

function forceLogout() {
  const { refreshToken, logout } = useAuthStore.getState()
  if (refreshToken) {
    // Intenta revocar el refresh token en el backend (best-effort, no bloquea)
    axios
      .post(`${API_URL}/auth/logout`, { RefreshToken: refreshToken })
      .catch(() => {})
  }
  logout()
  window.location.replace('/login')
}

http.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableRequest

    // Sólo interceptar 401 una vez por request y no en los propios endpoints de auth
    const isAuthEndpoint = original?.url?.startsWith('/auth/')
    if (error.response?.status !== 401 || original?._retry || isAuthEndpoint) {
      return Promise.reject(error)
    }

    const { refreshToken } = useAuthStore.getState()

    if (!refreshToken) {
      forceLogout()
      return Promise.reject(error)
    }

    // Si ya hay un refresh en curso, encolar esta request para reintentarla después
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then(newToken => {
        original!.headers!.Authorization = `Bearer ${newToken}`
        return http(original!)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post<AuthResponse>(`${API_URL}/auth/refresh`, {
        RefreshToken: refreshToken,
      })

      useAuthStore.getState().setAuth(data)
      flushQueue(null, data.accessToken)

      original!.headers!.Authorization = `Bearer ${data.accessToken}`
      return http(original!)
    } catch (refreshError) {
      flushQueue(refreshError, null)
      forceLogout()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default http

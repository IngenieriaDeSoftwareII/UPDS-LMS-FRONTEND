import http from '@/lib/http'
import type { AuthResponse, ChangePasswordDto, LoginDto } from '@/types/auth'

export const authService = {
  login: (data: LoginDto) =>
    http.post<AuthResponse>('/auth/login', data).then(res => res.data),

  refresh: (refreshToken: string) =>
    http.post<AuthResponse>('/auth/refresh', { RefreshToken: refreshToken }).then(res => res.data),

  logout: (refreshToken: string) =>
    http.post('/auth/logout', { RefreshToken: refreshToken }),

  changePassword: (data: ChangePasswordDto) =>
    http.post('/auth/change-password', data),
}

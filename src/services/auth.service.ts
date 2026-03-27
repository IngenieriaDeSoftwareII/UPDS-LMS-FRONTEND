import http from '@/lib/http'
import type { LoginDto, LoginResponse } from '@/types/auth'

export const authService = {
  login: (data: LoginDto) =>
    http.post<LoginResponse>('/auth/login', data).then(res => res.data),
}

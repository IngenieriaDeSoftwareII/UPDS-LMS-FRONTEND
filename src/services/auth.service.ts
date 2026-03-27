import http from '@/lib/http'
import type { BackendAuthResponse, LoginDto, LoginResponse, UserRole } from '@/types/auth'

const normalizeRole = (role: string): UserRole => {
  const normalized = role.toLowerCase()
  if (normalized === 'admin') return 'admin'
  if (normalized === 'docente' || normalized === 'teacher') return 'teacher'
  return 'student'
}

const decodeJwtPayload = (token: string): Record<string, unknown> => {
  try {
    const payload = token.split('.')[1]
    if (!payload) return {}
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(normalized)
    return JSON.parse(decoded) as Record<string, unknown>
  } catch {
    return {}
  }
}

const getStringClaim = (payload: Record<string, unknown>, claims: string[]): string | undefined => {
  for (const claim of claims) {
    const value = payload[claim]
    if (typeof value === 'string' && value.length > 0) return value
  }
  return undefined
}

export const authService = {
  login: (data: LoginDto) =>
    http.post<BackendAuthResponse>('/auth/login', data).then(res => {
      const backend = res.data
      const payload = decodeJwtPayload(backend.accessToken)
      const email =
        getStringClaim(payload, ['email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']) ??
        data.email
      const id =
        Number(
          getStringClaim(payload, ['sub', 'nameid', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']) ?? 0
        ) || 0

      const firstName = email.includes('@') ? email.split('@')[0] : 'Usuario'

      const response: LoginResponse = {
        token: backend.accessToken,
        user: {
          id,
          email,
          firstName,
          lastName: '',
          role: normalizeRole(backend.role),
        },
      }

      return response
    }),
}

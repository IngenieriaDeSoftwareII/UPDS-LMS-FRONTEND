import type { UserRole } from './auth'

// GET /api/users — item de la lista
export interface UserDto {
  id: string
  fullName: string
  email: string
  role: UserRole
  isActive: boolean
}

// POST /api/users — response.data
export interface UserCreatedDto {
  id: string
  fullName: string
  email: string
  role: UserRole
  temporaryPassword: string
}

// POST /api/users — request body
export interface CreateUserDto {
  personId: number
  email: string
  role: UserRole
  firstName?: string
  lastName?: string
}

// PATCH /api/users/{id} — request body (ambos opcionales)
export interface UpdateUserDto {
  email?: string
  role?: UserRole
}

// PATCH /api/users/{id}/status — request body
export interface UpdateUserStatusDto {
  isActive: boolean
  lockedUntil?: string // ISO DateTimeOffset, solo si IsActive=false
}

// POST /api/users/{id}/reset-password — response.data
export interface ResetPasswordResponseDto {
  userId: string
  temporaryPassword: string
}

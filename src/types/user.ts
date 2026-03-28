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
  PersonId: number
  Email: string
  Role: UserRole
}

// PATCH /api/users/{id} — request body (ambos opcionales)
export interface UpdateUserDto {
  Email?: string
  Role?: UserRole
}

// PATCH /api/users/{id}/status — request body
export interface UpdateUserStatusDto {
  IsActive: boolean
  LockedUntil?: string // ISO DateTimeOffset, solo si IsActive=false
}

// POST /api/users/{id}/reset-password — response.data
export interface ResetPasswordResponseDto {
  userId: string
  temporaryPassword: string
}

export type UserRole = 'admin' | 'teacher' | 'student'

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: UserRole
  avatar?: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

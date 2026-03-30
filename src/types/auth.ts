export type UserRole = 'Admin' | 'Docente' | 'Estudiante'

// POST /api/auth/login — request body
export interface LoginDto {
  Email: string
  Password: string
}

// POST /api/auth/login | /api/auth/refresh — response
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  role: UserRole
  redirectTo: string
}

// POST /api/auth/change-password — request body
export interface ChangePasswordDto {
  CurrentPassword: string
  NewPassword: string
  ConfirmNewPassword: string
}

import type { UserRole } from './auth'
import type { UpdatePersonDto } from './person'

// PATCH /api/profile/me — request body (misma estructura que UpdatePersonDto)
export type UpdateProfileDto = UpdatePersonDto

// GET /api/profile/me — response (camelCase, ASP.NET Core)
export interface ProfileDto {
  id: string          // UserId
  email: string
  role: UserRole
  personId: number
  firstName: string
  lastName: string
  motherLastName: string
  dateOfBirth: string // "YYYY-MM-DD"
  gender: 0 | 1 | 2
  nationalId: string
  nationalIdExpedition: string
  phoneNumber: string | null
  address: string | null
}

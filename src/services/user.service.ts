import http from '@/lib/http'
import type {
  UserDto,
  UserCreatedDto,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  ResetPasswordResponseDto,
} from '@/types/user'

export const userService = {
  getAll: (search?: string) =>
    http
      .get<UserDto[]>('/users', { params: search ? { search } : undefined })
      .then(res => res.data),

  create: (data: CreateUserDto) =>
    http
      .post<{ message: string; data: UserCreatedDto }>('/users', data)
      .then(res => res.data),

  update: (id: string, data: UpdateUserDto) =>
    http
      .patch<{ message: string; data: UserDto }>(`/users/${id}`, data)
      .then(res => res.data.data),

  resetPassword: (id: string) =>
    http
      .post<{ message: string; data: ResetPasswordResponseDto }>(`/users/${id}/reset-password`)
      .then(res => res.data),

  updateStatus: (id: string, data: UpdateUserStatusDto) =>
    http
      .patch<{ message: string; data: { id: string; isActive: boolean; lockedUntil: string | null } }>(
        `/users/${id}/status`,
        data,
      )
      .then(res => res.data),
}

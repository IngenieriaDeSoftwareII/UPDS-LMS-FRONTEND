import http from '@/lib/http'
import type { ProfileDto, UpdateProfileDto } from '@/types/profile'
import type { PersonDto } from '@/types/person'

export const profileService = {
  getMe: () =>
    http.get<ProfileDto>('/profile/me').then(res => res.data),

  updateMe: (data: UpdateProfileDto) =>
    http.patch<{ message: string; data: PersonDto }>('/profile/me', data).then(res => res.data),
}

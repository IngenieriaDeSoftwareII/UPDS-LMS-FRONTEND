import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import type { ChangePasswordDto } from '@/types/auth'

export const useChangePassword = () =>
  useMutation({
    mutationFn: (data: ChangePasswordDto) => authService.changePassword(data),
  })

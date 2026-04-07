import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { profileService } from '@/services/profile.service'
import { useAuthStore } from '@/store/auth.store'
import type { LoginDto } from '@/types/auth'

export const useLogin = () => {
  const { setAuth, setProfile } = useAuthStore()

  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: async (data) => {
      setAuth(data)
      // El token ya está en el store — el interceptor lo incluirá en esta llamada
      const profile = await profileService.getMe()
      setProfile(profile)
    },
  })
}

export const useLogout = () => {
  const { logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()

  return () => {
    if (refreshToken) {
      authService.logout(refreshToken).catch(() => {/* token ya revocado, ignorar */ })
    }
    logout()
    navigate('/login', { replace: true })
  }
}

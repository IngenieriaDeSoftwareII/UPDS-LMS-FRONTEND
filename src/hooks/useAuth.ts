import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { profileService } from '@/services/profile.service'
import { useAuthStore } from '@/store/auth.store'
import type { LoginDto, UserRole } from '@/types/auth'

const roleRoutes: Record<UserRole, string> = {
  Admin: '/admin/dashboard',
  Docente: '/teacher/dashboard',
  Estudiante: '/student/dashboard',
}

export const useLogin = () => {
  const { setAuth, setProfile } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: async (data) => {
      setAuth(data)
      // El token ya está en el store — el interceptor lo incluirá en esta llamada
      const profile = await profileService.getMe()
      setProfile(profile)
      navigate(roleRoutes[data.role], { replace: true })
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

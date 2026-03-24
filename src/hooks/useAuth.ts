import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import type { LoginDto } from '@/types/auth'

export const useLogin = () => {
  const setAuth = useAuthStore(s => s.setAuth)

  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: ({ user, token }) => setAuth(user, token),
  })
}

export const useLogout = () => {
  const logout = useAuthStore(s => s.logout)
  return logout
}

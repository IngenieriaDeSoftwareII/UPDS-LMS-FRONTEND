import { useQuery } from '@tanstack/react-query'
import http from '@/lib/http'
import { useAuthStore } from '@/store/auth.store'

interface CurrentProfile {
  personId: number
  id: number
  firstName?: string
  lastName?: string
  email?: string
}

export function useCurrentProfile() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => http.get<CurrentProfile>('/Profile/me').then(res => res.data),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  })
}

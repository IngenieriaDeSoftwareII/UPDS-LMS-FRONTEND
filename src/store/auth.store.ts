import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse, UserRole } from '@/types/auth'
import type { ProfileDto } from '@/types/profile'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  role: UserRole | null
  profile: ProfileDto | null
  isAuthenticated: boolean
  setAuth: (response: AuthResponse) => void
  setProfile: (profile: ProfileDto) => void
  logout: () => void
  hasRole: (roles: UserRole[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      role: null,
      profile: null,
      isAuthenticated: false,

      setAuth: ({ accessToken, refreshToken, role }) =>
        set({ accessToken, refreshToken, role, isAuthenticated: true }),

      setProfile: (profile) => set({ profile }),

      logout: () =>
        set({ accessToken: null, refreshToken: null, role: null, profile: null, isAuthenticated: false }),

      hasRole: (roles) => {
        const { role } = get()
        if (!role) return false
        return roles.includes(role)
      },
    }),
    { name: 'auth' }
  )
)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse, UserRole } from '@/types/auth'
import type { ProfileDto } from '@/types/profile'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  sessionTTL: number | null        // duración (ms) del refresh token emitida por el backend
  sessionExpiresAt: number | null  // timestamp absoluto (ms) en que expira el refresh token
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
      sessionTTL: null,
      sessionExpiresAt: null,
      role: null,
      profile: null,
      isAuthenticated: false,

      setAuth: ({ accessToken, refreshToken, sessionTTL, role }) =>
        set({ accessToken, refreshToken, sessionTTL, sessionExpiresAt: Date.now() + sessionTTL, role, isAuthenticated: true }),

      setProfile: (profile) => set({ profile }),

      logout: () =>
        set({ accessToken: null, refreshToken: null, sessionTTL: null, sessionExpiresAt: null, role: null, profile: null, isAuthenticated: false }),

      hasRole: (roles) => {
        const { role } = get()
        if (!role) return false
        return roles.includes(role)
      },
    }),
    { name: 'auth' }
  )
)

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'

export function useSessionExpiry(onExpired: () => void) {
  const sessionExpiresAt = useAuthStore(s => s.sessionExpiresAt)

  useEffect(() => {
    if (!sessionExpiresAt) return

    const remaining = sessionExpiresAt - Date.now()
    if (remaining <= 0) return  // ProtectedRoute ya maneja el reopen con sesión expirada

    const timer = setTimeout(onExpired, remaining)
    return () => clearTimeout(timer)
  }, [sessionExpiresAt, onExpired])
}

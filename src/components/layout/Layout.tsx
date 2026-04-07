import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { cn } from '@/lib/utils'
import { useIdleTimeout } from '@/hooks/useIdleTimeout'
import { useSessionExpiry } from '@/hooks/useSessionExpiry'
import { IdleWarningModal } from '@/components/IdleWarningModal'
import { SessionLockModal } from '@/components/SessionLockModal'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'

type IdleState = 'active' | 'warning' | 'locked'

const COUNTDOWN_START = 60

export function Layout() {
  const navigate = useNavigate()
  const logout         = useAuthStore(s => s.logout)
  const setAuth        = useAuthStore(s => s.setAuth)
  const sessionTTL     = useAuthStore(s => s.sessionTTL)
  const sessionExpiresAt = useAuthStore(s => s.sessionExpiresAt)

  const ttl = sessionTTL ?? 15 * 60 * 1000
  const buffer = ttl >= 120_000 ? 60_000 : 15_000
  const warnAfter = ttl - buffer
  const lockAfter = ttl
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [idleState, setIdleState] = useState<IdleState>('active')
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_START)
  const countdownRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleWarn = useCallback(() => {
    setSecondsLeft(COUNTDOWN_START)
    setIdleState('warning')
    countdownRef.current = setInterval(() => {
      setSecondsLeft(s => s - 1)
    }, 1000)
  }, [])

  const handleLock = useCallback(() => {
    clearInterval(countdownRef.current)
    setIdleState('locked')
  }, [])

  const handleActive = useCallback(() => {
    clearInterval(countdownRef.current)
    setIdleState('active')
    setSecondsLeft(COUNTDOWN_START)
  }, [])

  const handleRenewNeeded = useCallback(async () => {
    const { refreshToken } = useAuthStore.getState()
    if (!refreshToken) return
    try {
      const data = await authService.refresh(refreshToken)
      setAuth(data)
    } catch {
      // Si falla, useSessionExpiry manejará el logout al expirar
    }
  }, [setAuth])

  useSessionExpiry(() => setIdleState('locked'))

  const { reset } = useIdleTimeout({
    warnAfter,
    lockAfter,
    onWarn: handleWarn,
    onLock: handleLock,
    onActive: handleActive,
    enabled: idleState !== 'locked',
    expiresAt: sessionExpiresAt,
    renewThreshold: buffer + 5_000,
    onRenewNeeded: handleRenewNeeded,
  })

  const handleContinue = useCallback(() => reset(), [reset])

  const handleLogoutNow = useCallback(() => {
    clearInterval(countdownRef.current)
    logout()
    navigate('/login')
  }, [logout, navigate])

  const handleUnlocked = useCallback(() => reset(), [reset])

  const handleLogoutFromLock = useCallback(() => navigate('/login', { replace: true }), [navigate])

  useEffect(() => () => clearInterval(countdownRef.current), [])

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Navbar
        sidebarCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={cn(
        'pt-16 transition-all duration-300 min-h-screen',
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64',
      )}>
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>

      <IdleWarningModal
        open={idleState === 'warning'}
        secondsLeft={secondsLeft}
        onContinue={handleContinue}
        onLogoutNow={handleLogoutNow}
      />
      <SessionLockModal
        open={idleState === 'locked'}
        onUnlocked={handleUnlocked}
        onLogout={handleLogoutFromLock}
      />
    </div>
  )
}

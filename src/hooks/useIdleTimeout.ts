import { useEffect, useRef, useCallback } from 'react'

const EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const
const DEFAULT_RENEW_THRESHOLD = 5_000

interface Options {
  warnAfter: number
  lockAfter: number
  onWarn: () => void
  onLock: () => void
  onActive: () => void
  enabled?: boolean
  expiresAt?: number | null
  renewThreshold?: number
  onRenewNeeded?: () => void
}

export function useIdleTimeout({
  warnAfter, lockAfter, onWarn, onLock, onActive, enabled = true,
  expiresAt, renewThreshold = DEFAULT_RENEW_THRESHOLD, onRenewNeeded,
}: Options) {
  const warnTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const lockTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isRenewing = useRef(false)

  // Cuando sessionExpiresAt cambia (refresh exitoso) habilitamos la renovación nuevamente
  useEffect(() => {
    isRenewing.current = false
  }, [expiresAt])

  const reset = useCallback(() => {
    clearTimeout(warnTimer.current)
    clearTimeout(lockTimer.current)
    onActive()
    warnTimer.current = setTimeout(onWarn, warnAfter)
    lockTimer.current = setTimeout(onLock, lockAfter)

    if (expiresAt && onRenewNeeded && !isRenewing.current) {
      const remaining = expiresAt - Date.now()
      if (remaining > 0 && remaining < renewThreshold) {
        isRenewing.current = true
        onRenewNeeded()
      }
    }
  }, [warnAfter, lockAfter, onWarn, onLock, onActive, expiresAt, renewThreshold, onRenewNeeded])

  useEffect(() => {
    if (!enabled) {
      clearTimeout(warnTimer.current)
      clearTimeout(lockTimer.current)
      return
    }
    EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()
    return () => {
      EVENTS.forEach(e => window.removeEventListener(e, reset))
      clearTimeout(warnTimer.current)
      clearTimeout(lockTimer.current)
    }
  }, [reset, enabled])

  return { reset }
}

import { useEffect, useRef, useCallback } from 'react'

const WARN_AFTER = 1 * 60 * 1000
const LOCK_AFTER = 2 * 60 * 1000

const EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const

interface Options {
  onWarn: () => void
  onLock: () => void
  onActive: () => void
  enabled?: boolean
}

export function useIdleTimeout({ onWarn, onLock, onActive, enabled = true }: Options) {
  const warnTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const lockTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const reset = useCallback(() => {
    clearTimeout(warnTimer.current)
    clearTimeout(lockTimer.current)
    onActive()
    warnTimer.current = setTimeout(onWarn, WARN_AFTER)
    lockTimer.current = setTimeout(onLock, LOCK_AFTER)
  }, [onWarn, onLock, onActive])

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

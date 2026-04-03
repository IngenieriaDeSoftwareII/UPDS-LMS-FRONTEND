import { useEffect, useState } from 'react'

interface UseEvaluationTimerProps {
  maxSeconds: number
  autoStart?: boolean
  onTimeUp?: () => void
}

interface UseEvaluationTimerReturn {
  remainingSeconds: number
  minutes: number
  seconds: number
  formatTime: string
  percentage: number
  isTimeUp: boolean
  isLowTime: boolean
  pause: () => void
  resume: () => void
  reset: () => void
}

export function useEvaluationTimer({
  maxSeconds,
  autoStart = true,
  onTimeUp,
}: UseEvaluationTimerProps): UseEvaluationTimerReturn {
  const [remainingSeconds, setRemainingSeconds] = useState(maxSeconds)
  const [isRunning, setIsRunning] = useState(autoStart)

  const isTimeUp = remainingSeconds <= 0
  const isLowTime = remainingSeconds <= 60
  const percentage = (remainingSeconds / maxSeconds) * 100

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const formatTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  useEffect(() => {
    if (!isRunning || isTimeUp) return

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          onTimeUp?.()
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, isTimeUp, onTimeUp])

  const pause = () => setIsRunning(false)
  const resume = () => setIsRunning(true)
  const reset = () => {
    setRemainingSeconds(maxSeconds)
    setIsRunning(autoStart)
  }

  return {
    remainingSeconds,
    minutes,
    seconds,
    formatTime,
    percentage,
    isTimeUp,
    isLowTime,
    pause,
    resume,
    reset,
  }
}

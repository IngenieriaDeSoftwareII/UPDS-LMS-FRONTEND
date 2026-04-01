import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimerDisplayProps {
  maxSeconds: number
  onTimeUp?: () => void
  isPaused?: boolean
}

export function TimerDisplay({ maxSeconds, onTimeUp, isPaused = false }: TimerDisplayProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(maxSeconds)

  useEffect(() => {
    if (isPaused || remainingSeconds <= 0) return

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          onTimeUp?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [remainingSeconds, isPaused, onTimeUp])

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  const getTimeColor = () => {
    const percentage = (remainingSeconds / maxSeconds) * 100

    if (percentage > 50) return 'text-green-600'
    if (percentage > 25) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBackgroundColor = () => {
    const percentage = (remainingSeconds / maxSeconds) * 100

    if (percentage > 50) return 'bg-green-50'
    return 'bg-red-50'
  }

  const formatTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className={cn('flex items-center gap-3 rounded-lg px-4 py-3 font-semibold', getBackgroundColor())}>
      <Clock className={cn('w-5 h-5', getTimeColor())} />
      <span className={cn('text-lg', getTimeColor())}>
        {formatTime}
      </span>
      {remainingSeconds <= 60 && (
        <span className="text-sm text-red-600 ml-2">⏰ ¡Pronto se acaba!</span>
      )}
    </div>
  )
}

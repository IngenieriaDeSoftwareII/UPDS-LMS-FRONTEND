import type { ReactElement } from 'react'

type Props = {
  cx?: number
  cy?: number
  index?: number
  pointsLength: number
  color: string
  angleDeg?: number
}

export function ArrowEndDot({ cx, cy, index, pointsLength, color, angleDeg = 0 }: Props): ReactElement | null {
  if (typeof cx !== 'number' || typeof cy !== 'number') return null
  if (typeof index !== 'number') return null
  if (pointsLength <= 0) return null
  if (index !== pointsLength - 1) return null

  const angle = Number.isFinite(angleDeg) ? angleDeg : 0

  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle})`}>
      <path d="M-6,-6 L6,0 L-6,6 Z" fill={color} />
    </g>
  )
}


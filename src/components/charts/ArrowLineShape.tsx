import type { ReactElement } from 'react'

type Point = { x?: number | null; y?: number | null }

type Props = {
  points?: ReadonlyArray<Point>
  stroke?: string
  strokeWidth?: number | string
  markerId: string
  arrowSize?: number
}

export function ArrowLineShape({
  points,
  stroke = 'currentColor',
  strokeWidth = 2,
  markerId,
  arrowSize = 8,
}: Props): ReactElement | null {
  const pts = (points ?? []).filter(p => typeof p.x === 'number' && typeof p.y === 'number') as Array<{ x: number; y: number }>
  if (pts.length < 2) return null

  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <>
      <defs>
        <marker
          id={markerId}
          markerWidth={arrowSize}
          markerHeight={arrowSize}
          refX={arrowSize - 1}
          refY={arrowSize / 2}
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d={`M0,0 L0,${arrowSize} L${arrowSize},${arrowSize / 2} Z`} fill={stroke} />
        </marker>
      </defs>

      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        markerEnd={`url(#${markerId})`}
      />
    </>
  )
}


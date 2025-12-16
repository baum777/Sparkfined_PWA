import type { ChartDrawingPoint } from '@/domain/chart'

export interface PixelPoint {
  x: number
  y: number
}

export function mapDrawingPoints(
  points: ChartDrawingPoint[],
  mapTime: (ms: number) => number | null,
  mapPrice: (price: number) => number | null
): PixelPoint[] {
  return points
    .map((point) => {
      const x = mapTime(point.t)
      const y = mapPrice(point.p)

      if (x === null || y === null) return null

      return { x, y }
    })
    .filter((point): point is PixelPoint => Boolean(point))
}

export function getBoxBounds(points: PixelPoint[]): { x: number; y: number; width: number; height: number } | null {
  if (points.length < 2) return null

  const first = points[0]
  const second = points[1]
  if (!first || !second) return null

  const x = Math.min(first.x, second.x)
  const y = Math.min(first.y, second.y)
  const width = Math.abs(first.x - second.x)
  const height = Math.abs(first.y - second.y)

  if (width === 0 || height === 0) return null

  return { x, y, width, height }
}

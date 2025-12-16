import type { ChartDrawingPoint } from '@/domain/chart'
import type { PixelPoint } from '@/lib/chart/drawingGeometry'

export const DEFAULT_FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]

export function computeFibLevelPrices(
  p1: ChartDrawingPoint,
  p2: ChartDrawingPoint,
  levels: number[] = DEFAULT_FIB_LEVELS
): Array<{ level: number; price: number }> {
  const delta = p2.p - p1.p
  return levels.map((level) => ({ level, price: p1.p + delta * level }))
}

export function distanceToSegment(p: PixelPoint, a: PixelPoint, b: PixelPoint): number {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const apx = p.x - a.x
  const apy = p.y - a.y

  const abLenSq = abx * abx + aby * aby
  if (abLenSq === 0) return Math.hypot(apx, apy)

  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLenSq))
  const cx = a.x + t * abx
  const cy = a.y + t * aby
  return Math.hypot(p.x - cx, p.y - cy)
}

export interface ChannelGeometry {
  base: [PixelPoint, PixelPoint]
  parallel: [PixelPoint, PixelPoint]
  polygon: PixelPoint[]
  offset: PixelPoint
}

export function computeChannelGeometry(points: PixelPoint[]): ChannelGeometry | null {
  if (points.length < 3) return null
  const [a, b, c] = points
  if (!a || !b || !c) return null

  const ab = { x: b.x - a.x, y: b.y - a.y }
  const abLen = Math.hypot(ab.x, ab.y)
  if (abLen === 0) return null

  const normal = { x: -ab.y / abLen, y: ab.x / abLen }
  const ac = { x: c.x - a.x, y: c.y - a.y }
  const offsetMagnitude = ac.x * normal.x + ac.y * normal.y
  const offset = { x: normal.x * offsetMagnitude, y: normal.y * offsetMagnitude }

  const parallelA = { x: a.x + offset.x, y: a.y + offset.y }
  const parallelB = { x: b.x + offset.x, y: b.y + offset.y }

  return {
    base: [a, b],
    parallel: [parallelA, parallelB],
    polygon: [a, b, parallelB, parallelA],
    offset,
  }
}

export function pointInPolygon(point: PixelPoint, polygon: PixelPoint[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i += 1) {
    const xi = polygon[i]?.x
    const yi = polygon[i]?.y
    const xj = polygon[j]?.x
    const yj = polygon[j]?.y
    if (xi === undefined || yi === undefined || xj === undefined || yj === undefined) continue

    const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

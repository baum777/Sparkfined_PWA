import type { ChartDrawingRecord } from '@/domain/chart'
import type { PixelPoint } from '@/lib/chart/drawingGeometry'

const BASE_TOLERANCE = 5

function distanceToSegment(p: PixelPoint, a: PixelPoint, b: PixelPoint): number {
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

function lineHit(points: PixelPoint[], point: PixelPoint, tolerance: number): boolean {
  if (points.length < 2) return false
  const [a, b] = points
  if (!a || !b) return false
  return distanceToSegment(point, a, b) <= tolerance
}

function boxHit(points: PixelPoint[], point: PixelPoint, tolerance: number): boolean {
  if (points.length < 2) return false
  const [a, b] = points
  if (!a || !b) return false
  const minX = Math.min(a.x, b.x)
  const maxX = Math.max(a.x, b.x)
  const minY = Math.min(a.y, b.y)
  const maxY = Math.max(a.y, b.y)

  const withinX = point.x >= minX - tolerance && point.x <= maxX + tolerance
  const withinY = point.y >= minY - tolerance && point.y <= maxY + tolerance
  if (!withinX || !withinY) return false

  const nearLeft = Math.abs(point.x - minX) <= tolerance
  const nearRight = Math.abs(point.x - maxX) <= tolerance
  const nearTop = Math.abs(point.y - minY) <= tolerance
  const nearBottom = Math.abs(point.y - maxY) <= tolerance

  return nearLeft || nearRight || nearTop || nearBottom
}

function hlineHit(points: PixelPoint[], point: PixelPoint, tolerance: number): boolean {
  if (!points[0]) return false
  return Math.abs(point.y - points[0].y) <= tolerance
}

export type DrawingShape = {
  drawing: ChartDrawingRecord
  points: PixelPoint[]
}

export function hitTestDrawing(
  shape: DrawingShape,
  point: PixelPoint,
  devicePixelRatio: number
): boolean {
  const tolerance = BASE_TOLERANCE * (devicePixelRatio || 1)

  switch (shape.drawing.type) {
    case 'LINE':
    case 'FIB':
      return lineHit(shape.points, point, tolerance)
    case 'BOX':
      return boxHit(shape.points, point, tolerance)
    case 'HLINE':
      return hlineHit(shape.points, point, tolerance)
    default:
      return false
  }
}

export function findHitShape(
  shapes: DrawingShape[],
  point: PixelPoint,
  devicePixelRatio: number
): DrawingShape | undefined {
  for (let i = shapes.length - 1; i >= 0; i -= 1) {
    const shape = shapes[i]
    if (!shape) continue
    if (hitTestDrawing(shape, point, devicePixelRatio)) {
      return shape
    }
  }
  return undefined
}

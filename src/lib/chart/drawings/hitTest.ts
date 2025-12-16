import type { ChartDrawingRecord } from '@/domain/chart'
import type { PixelPoint } from '@/lib/chart/drawingGeometry'
import {
  DEFAULT_FIB_LEVELS,
  computeChannelGeometry,
  distanceToSegment,
  pointInPolygon,
} from '@/lib/chart/drawings/geometry'

const BASE_TOLERANCE = 5

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
  meta?: {
    fibLevels?: Array<{ y: number; xStart: number; xEnd: number }>
    channel?: ReturnType<typeof computeChannelGeometry>
  }
}

export function hitTestDrawing(
  shape: DrawingShape,
  point: PixelPoint,
  devicePixelRatio: number
): boolean {
  const tolerance = BASE_TOLERANCE * (devicePixelRatio || 1)

  switch (shape.drawing.type) {
    case 'LINE':
      return lineHit(shape.points, point, tolerance)
    case 'FIB': {
      const lines =
        shape.meta?.fibLevels ??
        (() => {
          if (shape.points.length < 2) return undefined
          const [a, b] = shape.points
          if (!a || !b) return undefined
          const levels = shape.drawing.levels ?? DEFAULT_FIB_LEVELS
          const minX = Math.min(a.x, b.x)
          const maxX = Math.max(a.x, b.x)
          return levels.map((level) => ({
            xStart: minX,
            xEnd: maxX,
            y: a.y + (b.y - a.y) * level,
          }))
        })()

      if (!lines || lines.length === 0) return false
      return lines.some((line) => {
        return lineHit(
          [
            { x: line.xStart, y: line.y },
            { x: line.xEnd, y: line.y },
          ],
          point,
          tolerance
        )
      })
    }
    case 'BOX':
      return boxHit(shape.points, point, tolerance)
    case 'HLINE':
      return hlineHit(shape.points, point, tolerance)
    case 'CHANNEL': {
      const channel = shape.meta?.channel ?? computeChannelGeometry(shape.points)
      if (!channel) return false

      const baseHit = lineHit(channel.base, point, tolerance)
      const parallelHit = lineHit(channel.parallel, point, tolerance)
      const inside = pointInPolygon(point, channel.polygon)
      return baseHit || parallelHit || inside
    }
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

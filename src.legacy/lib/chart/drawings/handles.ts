import type { ChartDrawingRecord } from '@/domain/chart'
import { getBoxBounds } from '@/lib/chart/drawingGeometry'
import type { DrawingShape } from '@/lib/chart/drawings/hitTest'
import type { PixelPoint } from '@/lib/chart/drawingGeometry'

export type DrawingHandleId =
  | 'line-start'
  | 'line-end'
  | 'box-top-left'
  | 'box-top-right'
  | 'box-bottom-left'
  | 'box-bottom-right'
  | 'fib-start'
  | 'fib-end'
  | 'channel-a'
  | 'channel-b'
  | 'channel-c'

export interface DrawingHandle {
  id: DrawingHandleId
  pointIndex: number
  position: PixelPoint
}

const HANDLE_TOLERANCE = 8

const distance = (a: PixelPoint, b: PixelPoint): number => Math.hypot(a.x - b.x, a.y - b.y)

function nearestPointIndex(target: PixelPoint, points: PixelPoint[]): number {
  if (points.length === 0) return 0

  let nearest = 0
  let nearestDistance = Number.POSITIVE_INFINITY

  points.forEach((point, index) => {
    const dist = distance(target, point)
    if (dist < nearestDistance) {
      nearest = index
      nearestDistance = dist
    }
  })

  return nearest
}

export function getDrawingHandles(shape: DrawingShape): DrawingHandle[] {
  if (!shape.points.length) return []

  if (shape.drawing.type === 'LINE' || shape.drawing.type === 'FIB') {
    const handles: DrawingHandle[] = []
    if (shape.points[0])
      handles.push({
        id: shape.drawing.type === 'FIB' ? 'fib-start' : 'line-start',
        pointIndex: 0,
        position: shape.points[0],
      })
    if (shape.points[1])
      handles.push({
        id: shape.drawing.type === 'FIB' ? 'fib-end' : 'line-end',
        pointIndex: 1,
        position: shape.points[1],
      })
    return handles
  }

  if (shape.drawing.type === 'BOX') {
    const bounds = getBoxBounds(shape.points)
    if (!bounds) return []

    const corners: Array<{ id: DrawingHandleId; position: PixelPoint }> = [
      { id: 'box-top-left', position: { x: bounds.x, y: bounds.y } },
      { id: 'box-top-right', position: { x: bounds.x + bounds.width, y: bounds.y } },
      { id: 'box-bottom-left', position: { x: bounds.x, y: bounds.y + bounds.height } },
      { id: 'box-bottom-right', position: { x: bounds.x + bounds.width, y: bounds.y + bounds.height } },
    ]

    return corners.map((corner) => ({
      ...corner,
      pointIndex: nearestPointIndex(corner.position, shape.points),
    }))
  }

  if (shape.drawing.type === 'CHANNEL') {
    const handles: DrawingHandle[] = []
    if (shape.points[0]) handles.push({ id: 'channel-a', pointIndex: 0, position: shape.points[0] })
    if (shape.points[1]) handles.push({ id: 'channel-b', pointIndex: 1, position: shape.points[1] })
    if (shape.points[2]) handles.push({ id: 'channel-c', pointIndex: 2, position: shape.points[2] })
    return handles
  }

  return []
}

export function findHandleHit(handles: DrawingHandle[], point: PixelPoint, devicePixelRatio: number): DrawingHandle | undefined {
  const tolerance = HANDLE_TOLERANCE * (devicePixelRatio || 1)

  return handles.find((handle) => distance(handle.position, point) <= tolerance)
}

export function isInsideBox(points: PixelPoint[], point: PixelPoint, devicePixelRatio: number): boolean {
  const bounds = getBoxBounds(points)
  if (!bounds) return false

  const tolerance = HANDLE_TOLERANCE * (devicePixelRatio || 1)
  return (
    point.x >= bounds.x - tolerance &&
    point.x <= bounds.x + bounds.width + tolerance &&
    point.y >= bounds.y - tolerance &&
    point.y <= bounds.y + bounds.height + tolerance
  )
}

export function mergeWithPreview(
  drawings: ChartDrawingRecord[],
  preview?: ChartDrawingRecord
): ChartDrawingRecord[] {
  if (!preview) return drawings
  return [...drawings.filter((item) => item.id !== preview.id), preview]
}

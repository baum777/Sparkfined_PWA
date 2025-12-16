import type { ChartDrawingPoint, ChartDrawingRecord } from '@/domain/chart'
import type { DrawingHandleId } from '@/lib/chart/drawings/handles'

export interface DrawingDelta {
  t: number
  p: number
}

export function moveDrawing(drawing: ChartDrawingRecord, delta: DrawingDelta): ChartDrawingRecord {
  return {
    ...drawing,
    points: drawing.points.map((point) => ({ t: point.t + delta.t, p: point.p + delta.p })),
  }
}

export function resizeDrawingAtHandle(
  drawing: ChartDrawingRecord,
  handle: DrawingHandleId,
  targetPoint: ChartDrawingPoint,
  pointIndex: number
): ChartDrawingRecord {
  if (drawing.points.length === 0) return drawing

  if (drawing.type === 'LINE' || drawing.type === 'FIB') {
    const updated = drawing.points.map((point, index) => (index === pointIndex ? targetPoint : point))
    return { ...drawing, points: updated }
  }

  if (drawing.type === 'BOX') {
    const updated = drawing.points.map((point, index) => {
      if (index !== pointIndex) return point

      if (handle === 'box-top-left') {
        return { t: Math.min(targetPoint.t, point.t), p: Math.max(targetPoint.p, point.p) }
      }

      if (handle === 'box-top-right') {
        return { t: Math.max(targetPoint.t, point.t), p: Math.max(targetPoint.p, point.p) }
      }

      if (handle === 'box-bottom-left') {
        return { t: Math.min(targetPoint.t, point.t), p: Math.min(targetPoint.p, point.p) }
      }

      if (handle === 'box-bottom-right') {
        return { t: Math.max(targetPoint.t, point.t), p: Math.min(targetPoint.p, point.p) }
      }

      return targetPoint
    })

    return { ...drawing, points: updated }
  }

  if (drawing.type === 'HLINE') {
    const priceOnly = targetPoint.p
    return {
      ...drawing,
      points: drawing.points.map((point) => ({ t: point.t, p: priceOnly })),
    }
  }

  if (drawing.type === 'CHANNEL') {
    const updated = drawing.points.map((point, index) => (index === pointIndex ? targetPoint : point))
    return { ...drawing, points: updated }
  }

  return drawing
}

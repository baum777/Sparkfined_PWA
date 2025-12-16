import type { ChartDrawingRecord } from '@/domain/chart'
import { findHitShape, hitTestDrawing, type DrawingShape } from '@/lib/chart/drawings/hitTest'

const baseDrawing: ChartDrawingRecord = {
  id: 'd1',
  symbol: 'SOL',
  timeframe: '1h',
  type: 'LINE',
  points: [],
}

describe('drawing hit testing', () => {
  const dpr = 2

  it('hits lines within tolerance scaled by devicePixelRatio', () => {
    const shape: DrawingShape = {
      drawing: { ...baseDrawing, type: 'LINE' },
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
    }

    expect(hitTestDrawing(shape, { x: 5, y: 9 }, dpr)).toBe(true)
    expect(hitTestDrawing(shape, { x: 5, y: 20 }, dpr)).toBe(false)
  })

  it('hits rectangles on edges only', () => {
    const shape: DrawingShape = {
      drawing: { ...baseDrawing, id: 'box', type: 'BOX' },
      points: [
        { x: 10, y: 10 },
        { x: 30, y: 30 },
      ],
    }

    expect(hitTestDrawing(shape, { x: 10, y: 20 }, 1)).toBe(true)
    expect(hitTestDrawing(shape, { x: 20, y: 20 }, 1)).toBe(false)
  })

  it('prefers the last drawn shape when multiple overlap', () => {
    const shapes: DrawingShape[] = [
      {
        drawing: { ...baseDrawing, id: 'first', type: 'HLINE' },
        points: [{ x: 0, y: 50 }],
      },
      {
        drawing: { ...baseDrawing, id: 'second', type: 'HLINE' },
        points: [{ x: 0, y: 52 }],
      },
    ]

    const hit = findHitShape(shapes, { x: 10, y: 51 }, 1)
    expect(hit?.drawing.id).toBe('second')
  })
})

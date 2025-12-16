import { getBoxBounds, mapDrawingPoints } from '@/lib/chart/drawingGeometry'

describe('drawing geometry helpers', () => {
  it('maps drawing points using provided coordinate mappers', () => {
    const timeMapper = vi.fn((ms: number) => (ms === 1 ? 10 : null))
    const priceMapper = vi.fn((price: number) => (price > 0 ? price * 2 : null))

    const mapped = mapDrawingPoints(
      [
        { t: 1, p: 50 },
        { t: 2, p: -1 },
      ],
      timeMapper,
      priceMapper
    )

    expect(mapped).toEqual([{ x: 10, y: 100 }])
    expect(timeMapper).toHaveBeenCalledTimes(2)
    expect(priceMapper).toHaveBeenCalledTimes(2)
  })

  it('returns normalized bounds for two points', () => {
    const bounds = getBoxBounds([
      { x: 30, y: 80 },
      { x: 10, y: 20 },
    ])

    expect(bounds).toEqual({ x: 10, y: 20, width: 20, height: 60 })
  })

  it('returns null when bounds are flat or incomplete', () => {
    expect(getBoxBounds([{ x: 0, y: 0 }])).toBeNull()
    expect(
      getBoxBounds([
        { x: 5, y: 5 },
        { x: 5, y: 5 },
      ])
    ).toBeNull()
  })
})

import { computeFibLevelPrices, computeChannelGeometry } from '@/lib/chart/drawings/geometry'

describe('fib retracement helpers', () => {
  it('computes fib level prices between two anchors', () => {
    const levels = computeFibLevelPrices(
      { t: 0, p: 100 },
      { t: 1, p: 200 },
      [0, 0.5, 1]
    )

    expect(levels).toEqual([
      { level: 0, price: 100 },
      { level: 0.5, price: 150 },
      { level: 1, price: 200 },
    ])
  })
})

describe('channel geometry', () => {
  it('builds parallel lines using perpendicular offset from third point', () => {
    const geometry = computeChannelGeometry([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 0, y: 10 },
    ])

    expect(geometry?.base).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ])
    expect(geometry?.parallel[0].y).toBeCloseTo(10)
    expect(geometry?.parallel[1].y).toBeCloseTo(10)
    expect(geometry?.polygon).toHaveLength(4)
  })
})

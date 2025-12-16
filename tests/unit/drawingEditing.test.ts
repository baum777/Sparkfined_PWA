import type { ChartDrawingRecord } from '@/domain/chart'
import { moveDrawing, resizeDrawingAtHandle } from '@/lib/chart/drawings/editing'

const baseLine: ChartDrawingRecord = {
  id: 'line-1',
  symbol: 'SOL',
  timeframe: '1h',
  type: 'LINE',
  points: [
    { t: 1_700_000_000, p: 100 },
    { t: 1_700_100_000, p: 110 },
  ],
}

describe('drawing editing helpers', () => {
  it('moves drawings by applying delta to all points', () => {
    const moved = moveDrawing(baseLine, { t: 1_000, p: -5 })

    expect(moved.points[0]).toEqual({ t: 1_700_001_000, p: 95 })
    expect(moved.points[1]).toEqual({ t: 1_700_101_000, p: 105 })
  })

  it('updates the targeted line handle while keeping the opposite anchor', () => {
    const resized = resizeDrawingAtHandle(baseLine, 'line-end', { t: 1_700_200_000, p: 130 }, 1)

    expect(resized.points[0]).toEqual(baseLine.points[0])
    expect(resized.points[1]).toEqual({ t: 1_700_200_000, p: 130 })
  })

  it('resizes box corners respecting the dragged handle', () => {
    const box: ChartDrawingRecord = {
      id: 'box-1',
      symbol: 'SOL',
      timeframe: '1h',
      type: 'BOX',
      points: [
        { t: 1_700_000_000, p: 120 },
        { t: 1_700_200_000, p: 140 },
      ],
    }

    const resized = resizeDrawingAtHandle(box, 'box-bottom-right', { t: 1_700_300_000, p: 110 }, 1)

    expect(resized.points[0]).toEqual(box.points[0])
    expect(resized.points[1]).toEqual({ t: 1_700_300_000, p: 110 })
  })

  it('aligns horizontal lines to the new price level for all points', () => {
    const hline: ChartDrawingRecord = {
      id: 'hline-1',
      symbol: 'SOL',
      timeframe: '1h',
      type: 'HLINE',
      points: [
        { t: 1_700_000_000, p: 115 },
        { t: 1_700_100_000, p: 115 },
      ],
    }

    const resized = resizeDrawingAtHandle(hline, 'line-start', { t: 1_700_050_000, p: 125 }, 0)

    expect(resized.points[0]).toEqual({ t: 1_700_000_000, p: 125 })
    expect(resized.points[1]).toEqual({ t: 1_700_100_000, p: 125 })
  })

  it('updates a channel handle while keeping other anchors intact', () => {
    const channel: ChartDrawingRecord = {
      id: 'channel-1',
      symbol: 'SOL',
      timeframe: '1h',
      type: 'CHANNEL',
      points: [
        { t: 1_700_000_000, p: 100 },
        { t: 1_700_100_000, p: 110 },
        { t: 1_700_050_000, p: 115 },
      ],
    }

    const resized = resizeDrawingAtHandle(channel, 'channel-c', { t: 1_700_060_000, p: 130 }, 2)

    expect(resized.points[0]).toEqual(channel.points[0])
    expect(resized.points[1]).toEqual(channel.points[1])
    expect(resized.points[2]).toEqual({ t: 1_700_060_000, p: 130 })
  })
})

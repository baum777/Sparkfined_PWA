import type { ChartDrawingRecord } from '@/domain/chart'
import { findHandleHit, getDrawingHandles, isInsideBox } from '@/lib/chart/drawings/handles'
import type { DrawingShape } from '@/lib/chart/drawings/hitTest'

const boxShape: DrawingShape = {
  drawing: {
    id: 'box',
    symbol: 'SOL',
    timeframe: '1h',
    type: 'BOX',
    points: [
      { t: 1_700_000_000, p: 120 },
      { t: 1_700_200_000, p: 140 },
    ],
  } satisfies ChartDrawingRecord,
  points: [
    { x: 10, y: 10 },
    { x: 30, y: 30 },
  ],
}

describe('drawing handles', () => {
  it('exposes four handles for boxes', () => {
    const handles = getDrawingHandles(boxShape)
    expect(handles).toHaveLength(4)
    const ids = handles.map((handle) => handle.id)
    expect(ids).toEqual(expect.arrayContaining(['box-top-left', 'box-top-right', 'box-bottom-left', 'box-bottom-right']))
  })

  it('detects handle hits using device pixel ratio aware tolerance', () => {
    const handles = getDrawingHandles(boxShape)
    const hit = findHandleHit(handles, { x: 10, y: 10 }, 2)
    expect(hit?.id).toBe('box-top-left')
  })

  it('treats box interiors as valid move targets', () => {
    expect(isInsideBox(boxShape.points, { x: 20, y: 20 }, 1)).toBe(true)
    expect(isInsideBox(boxShape.points, { x: 100, y: 100 }, 1)).toBe(false)
  })

  it('exposes channel handles for three anchor points', () => {
    const channelShape: DrawingShape = {
      drawing: { ...boxShape.drawing, type: 'CHANNEL' },
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 10 },
      ],
    }

    const handles = getDrawingHandles(channelShape)
    expect(handles.map((handle) => handle.id)).toEqual(['channel-a', 'channel-b', 'channel-c'])
  })
})

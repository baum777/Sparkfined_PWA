import type { ChartDrawingRecord } from '@/domain/chart'
import { canRedo, canUndo, commitHistory, createHistory, redoHistory, undoHistory } from '@/lib/chart/drawings/history'

const drawing = (id: string): ChartDrawingRecord => ({
  id,
  symbol: 'SOL',
  timeframe: '1h',
  type: 'LINE',
  points: [
    { t: 1_700_000_000, p: 100 },
    { t: 1_700_100_000, p: 110 },
  ],
})

describe('drawing history stack', () => {
  it('pushes commits up to the configured limit and supports undo/redo', () => {
    let history = createHistory([drawing('a')], 2)
    history = commitHistory(history, [drawing('a'), drawing('b')])
    history = commitHistory(history, [drawing('c')])

    expect(canUndo(history)).toBe(true)
    expect(canRedo(history)).toBe(false)
    expect(history.past).toHaveLength(2)

    const { state: afterUndo, value: undone } = undoHistory(history)
    expect(undone?.[0]?.id).toBe('a')
    expect(canRedo(afterUndo)).toBe(true)

    const { state: afterRedo, value: redone } = redoHistory(afterUndo)
    expect(redone?.[0]?.id).toBe('c')
    expect(canUndo(afterRedo)).toBe(true)
  })

  it('ignores undo/redo when stacks are empty', () => {
    const history = createHistory([], 1)
    expect(undoHistory(history).state.present).toEqual([])
    expect(redoHistory(history).state.present).toEqual([])
  })

  it('handles fib and channel drawings in history entries', () => {
    const fib: ChartDrawingRecord = {
      id: 'fib-1',
      symbol: 'SOL',
      timeframe: '1h',
      type: 'FIB',
      points: [
        { t: 1, p: 100 },
        { t: 2, p: 120 },
      ],
      levels: [0, 0.5, 1],
    }
    const channel: ChartDrawingRecord = {
      id: 'channel-1',
      symbol: 'SOL',
      timeframe: '1h',
      type: 'CHANNEL',
      points: [
        { t: 1, p: 90 },
        { t: 2, p: 95 },
        { t: 1.5, p: 100 },
      ],
    }

    let history = createHistory([], 3)
    history = commitHistory(history, [fib])
    history = commitHistory(history, [fib, channel])

    const undone = undoHistory(history)
    expect(undone.value?.[0]?.id).toBe('fib-1')

    const redone = redoHistory(undone.state)
    expect(redone.value?.length).toBe(2)
    expect(redone.value?.[1]?.id).toBe('channel-1')
  })
})

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { OhlcReplayEngine } from '@/lib/replay/ohlcReplayEngine'
import type { OhlcPoint } from '@/types/journal'

const SAMPLE: OhlcPoint[] = [
  { t: 1, o: 1, h: 2, l: 0.5, c: 1.5, v: 10 },
  { t: 2, o: 1.5, h: 2.5, l: 1, c: 2, v: 12 },
  { t: 3, o: 2, h: 3, l: 1.5, c: 2.5, v: 15 },
]

describe('OhlcReplayEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('replays series from start to end and stops', () => {
    const ticks: number[] = []
    const complete = vi.fn()
    const engine = new OhlcReplayEngine({
      candles: SAMPLE,
      speedMs: 50,
      onTick: ({ index }) => ticks.push(index),
      onComplete: complete,
    })

    const started = engine.start()
    expect(started).toBe(true)

    vi.advanceTimersByTime(200)

    expect(ticks).toEqual([0, 1, 2])
    expect(complete).toHaveBeenCalledTimes(1)
    expect(engine.status).toBe('stopped')
  })

  it('supports pause and resume without skipping candles', () => {
    const ticks: number[] = []
    const engine = new OhlcReplayEngine({ candles: SAMPLE, speedMs: 50, onTick: ({ index }) => ticks.push(index) })

    engine.start()
    vi.advanceTimersByTime(60)
    engine.pause()
    vi.advanceTimersByTime(200)

    expect(ticks).toEqual([0, 1])

    engine.resume()
    vi.advanceTimersByTime(200)

    expect(ticks).toEqual([0, 1, 2])
    expect(engine.status).toBe('stopped')
  })

  it('calls onTick with candle data and respects boundaries', () => {
    const tickSpy = vi.fn()
    const engine = new OhlcReplayEngine({
      candles: SAMPLE,
      fromIndex: 1,
      toIndex: 2,
      speedMs: 20,
      onTick: tickSpy,
    })

    engine.start()
    vi.advanceTimersByTime(100)

    expect(tickSpy).toHaveBeenCalledTimes(2)
    expect(tickSpy).toHaveBeenNthCalledWith(1, { index: 1, candle: SAMPLE[1], isLast: false })
    expect(tickSpy).toHaveBeenNthCalledWith(2, { index: 2, candle: SAMPLE[2], isLast: true })
  })

  it('handles empty series gracefully', () => {
    const tickSpy = vi.fn()
    const engine = new OhlcReplayEngine({ candles: [], onTick: tickSpy })

    const started = engine.start()

    expect(started).toBe(false)
    expect(tickSpy).not.toHaveBeenCalled()
    expect(engine.status).toBe('idle')
  })

  it('updates speed on the fly while playing', () => {
    const tickSpy = vi.fn()
    const engine = new OhlcReplayEngine({ candles: SAMPLE, speedMs: 50, onTick: tickSpy })

    engine.start()
    vi.advanceTimersByTime(60)
    engine.setSpeed(10)
    vi.advanceTimersByTime(30)

    expect(tickSpy.mock.calls.map((call) => call[0].index)).toEqual([0, 1, 2])
  })
})

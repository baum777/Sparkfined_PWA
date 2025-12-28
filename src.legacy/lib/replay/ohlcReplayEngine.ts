import type { OhlcPoint } from '@/types/journal'

export type ReplayState = 'idle' | 'playing' | 'paused' | 'stopped'

export interface ReplayTick {
  index: number
  candle: OhlcPoint
  isLast: boolean
}

export interface OhlcReplayOptions {
  candles: OhlcPoint[]
  speedMs?: number
  fromIndex?: number
  toIndex?: number
  onTick?: (tick: ReplayTick) => void
  onComplete?: () => void
}

/**
 * Deterministic OHLC replay engine.
 * - Single timer with cleanup safeguards
 * - Supports start/pause/resume/stop and seeking
 * - Emits normalized candles to consumers for stable testing
 */
export class OhlcReplayEngine {
  private readonly candles: OhlcPoint[]
  private readonly startIndex: number
  private readonly endIndex: number
  private state: ReplayState = 'idle'
  private currentIndex: number
  private speedMs: number
  private timer: ReturnType<typeof setTimeout> | null = null
  private readonly onTick?: (tick: ReplayTick) => void
  private readonly onComplete?: () => void

  constructor({ candles, speedMs = 1000, fromIndex = 0, toIndex, onTick, onComplete }: OhlcReplayOptions) {
    this.candles = normalizeCandles(candles)
    this.startIndex = clampIndex(fromIndex, this.candles.length)
    const resolvedEndIndex = typeof toIndex === 'number' ? clampIndex(toIndex, this.candles.length) : this.candles.length - 1
    this.endIndex = Math.max(this.startIndex, resolvedEndIndex)
    this.currentIndex = this.startIndex
    this.speedMs = Math.max(10, speedMs)
    this.onTick = onTick
    this.onComplete = onComplete
  }

  get status(): ReplayState {
    return this.state
  }

  get index(): number {
    return this.currentIndex
  }

  start(): boolean {
    if (!this.candles.length) {
      return false
    }

    this.stopTimer()
    this.state = 'playing'
    this.emitTick()
    this.scheduleNext()
    return true
  }

  pause(): void {
    if (this.state !== 'playing') return
    this.stopTimer()
    this.state = 'paused'
  }

  resume(): void {
    if (!this.candles.length) return
    if (this.state === 'playing') return

    this.state = 'playing'
    this.scheduleNext()
  }

  stop(): void {
    this.stopTimer()
    this.state = 'stopped'
    this.currentIndex = this.startIndex
  }

  seek(targetIndex: number): void {
    this.currentIndex = clampIndex(targetIndex, this.candles.length)
    if (this.state === 'playing') {
      this.stopTimer()
      this.scheduleNext()
    }
  }

  setSpeed(nextMs: number): void {
    this.speedMs = Math.max(10, nextMs)
    if (this.state === 'playing') {
      this.stopTimer()
      this.scheduleNext()
    }
  }

  private emitTick(): void {
    const candle = this.candles[this.currentIndex]
    if (!candle) return

    const isLast = this.currentIndex >= this.endIndex
    this.onTick?.({ index: this.currentIndex, candle, isLast })

    if (isLast) {
      this.state = 'stopped'
      this.onComplete?.()
      this.stopTimer()
    }
  }

  private scheduleNext(): void {
    if (this.state !== 'playing') return
    if (this.currentIndex >= this.endIndex) return

    this.timer = setTimeout(() => {
      this.currentIndex = Math.min(this.currentIndex + 1, this.endIndex)
      this.emitTick()
      this.scheduleNext()
    }, this.speedMs)
  }

  private stopTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}

function clampIndex(index: number, length: number): number {
  if (length === 0) return 0
  return Math.min(Math.max(0, index), Math.max(0, length - 1))
}

function normalizeCandles(candles: OhlcPoint[]): OhlcPoint[] {
  if (!Array.isArray(candles)) return []

  return candles
    .filter((candle) => candle && typeof candle.t === 'number')
    .map((candle) => ({
      t: Number(candle.t),
      o: Number(candle.o),
      h: Number(candle.h),
      l: Number(candle.l),
      c: Number(candle.c),
      v: candle.v === undefined ? undefined : Number(candle.v),
    }))
}

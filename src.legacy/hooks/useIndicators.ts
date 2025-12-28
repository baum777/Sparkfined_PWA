import { useMemo } from 'react'
import type { ChartIndicatorOverlay, ComputedIndicator, OhlcCandle } from '@/domain/chart'
import { buildIndicators } from '@/lib/indicators'

export function useIndicators(candles: OhlcCandle[], overlays?: ChartIndicatorOverlay[]): ComputedIndicator[] {
  return useMemo(() => buildIndicators(candles, overlays), [candles, overlays])
}

export default useIndicators

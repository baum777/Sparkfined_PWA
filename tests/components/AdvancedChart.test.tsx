import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import AdvancedChart from '@/components/chart/AdvancedChart'
import type { ChartViewState, OhlcCandle } from '@/domain/chart'

vi.mock('lightweight-charts', () => {
  const setData = vi.fn()
  const setMarkers = vi.fn()
  return {
    createChart: () => ({
      addCandlestickSeries: () => ({ setData, setMarkers }),
      addHistogramSeries: () => ({ setData }),
      addLineSeries: () => ({ setData }),
      applyOptions: vi.fn(),
      removeSeries: vi.fn(),
      remove: vi.fn(),
    }),
    CrosshairMode: { Normal: 'Normal' },
  }
})

const baseViewState: ChartViewState = {
  timeframe: '15m',
  indicators: {},
  visual: { showVolume: true, showGrid: false, candleStyle: 'candle' },
}

const sampleCandles: OhlcCandle[] = [
  { t: 1_700_000_000_000, o: 10, h: 12, l: 9, c: 11, v: 1000 },
]

describe('AdvancedChart status overlays', () => {
  beforeAll(() => {
    // @ts-expect-error - jsdom polyfill
    global.ResizeObserver = class {
      observe() {}
      disconnect() {}
    }
  })

  it('shows loading overlay when fetching with no data', () => {
    render(
      <AdvancedChart
        candles={[]}
        status="loading"
        source="network"
        viewState={baseViewState}
        lastUpdatedAt={Date.now()}
      />
    )

    expect(screen.getByText(/Loading candles/i)).toBeTruthy()
  })

  it('shows no-data overlay when status is no-data', () => {
    render(
      <AdvancedChart
        candles={[]}
        status="no-data"
        source="network"
        viewState={baseViewState}
      />
    )

    expect(screen.getByText(/No candles yet/i)).toBeTruthy()
  })

  it('shows stale badge when using cached data', () => {
    render(
      <AdvancedChart
        candles={sampleCandles}
        status="stale"
        source="cache"
        viewState={baseViewState}
      />
    )

    expect(screen.getByText(/Showing cached data/i)).toBeTruthy()
  })

  it('renders annotation pills and triggers callback', () => {
    const onAnnotationClick = vi.fn()
    render(
      <AdvancedChart
        candles={sampleCandles}
        status="success"
        source="network"
        viewState={baseViewState}
        annotations={[{ id: 'a1', candleTime: 1_700_000_000_000, label: 'Alert', kind: 'alert' }]}
        onAnnotationClick={onAnnotationClick}
      />
    )

    const button = screen.getByText(/Alert/)
    button.click()
    expect(onAnnotationClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'a1', kind: 'alert', label: 'Alert' })
    )
  })
})

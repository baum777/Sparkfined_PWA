import { beforeEach, describe, expect, it } from 'vitest'
import { useChartUiStore } from '@/store/chartUiStore'

const address = 'So11111111111111111111111111111111111111112'

describe('chartUiStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useChartUiStore.setState({ indicatorConfigs: {}, hasSeenIntro: false })
  })

  it('toggles overlays and persists config', () => {
    const overlay = { type: 'sma', period: 20 } as const
    useChartUiStore.getState().toggleOverlay(address, overlay)
    const cleared = useChartUiStore.getState().getConfigFor(address)
    expect(cleared.overlays.some((item) => JSON.stringify(item) === JSON.stringify(overlay))).toBe(false)

    useChartUiStore.getState().toggleOverlay(address, overlay)
    const restored = useChartUiStore.getState().getConfigFor(address)
    expect(restored.overlays.some((item) => JSON.stringify(item) === JSON.stringify(overlay))).toBe(true)
    expect(localStorage.getItem('sparkfined.chart.indicators')).toBeTruthy()
  })

  it('applies presets', () => {
    useChartUiStore.getState().applyPreset(address, 'position')
    const config = useChartUiStore.getState().getConfigFor(address)
    expect(config.preset).toBe('position')
    expect(config.overlays.length).toBeGreaterThan(0)
  })

  it('tracks intro dismissal with persistence', () => {
    expect(useChartUiStore.getState().hasSeenIntro).toBe(false)
    useChartUiStore.getState().dismissIntro()
    expect(useChartUiStore.getState().hasSeenIntro).toBe(true)
    expect(localStorage.getItem('sparkfined.chart.intro.v1')).toBe('true')
  })
})

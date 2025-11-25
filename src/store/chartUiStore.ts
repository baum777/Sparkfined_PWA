import { create } from 'zustand'
import type { ChartIndicatorOverlay, IndicatorConfig, IndicatorPresetId } from '@/domain/chart'

const STORAGE_KEY = 'sparkfined.chart.indicators'
const INTRO_KEY = 'sparkfined.chart.intro.v1'
const DEFAULT_OVERLAYS: ChartIndicatorOverlay[] = [
  { type: 'sma', period: 20 },
  { type: 'ema', period: 50 },
]

function loadPersisted(): Record<string, IndicatorConfig> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, IndicatorConfig>
    return parsed || {}
  } catch (error) {
    console.warn('[chartUiStore] failed to load persisted indicator config', error)
    return {}
  }
}

function persist(configs: Record<string, IndicatorConfig>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
  } catch (error) {
    console.warn('[chartUiStore] failed to persist indicator config', error)
  }
}

function loadIntroSeen(): boolean {
  try {
    const raw = localStorage.getItem(INTRO_KEY)
    return raw === 'true'
  } catch (error) {
    console.warn('[chartUiStore] failed to load intro flag', error)
    return false
  }
}

function persistIntroSeen(value: boolean) {
  try {
    localStorage.setItem(INTRO_KEY, String(value))
  } catch (error) {
    console.warn('[chartUiStore] failed to persist intro flag', error)
  }
}

export interface ChartUiState {
  indicatorConfigs: Record<string, IndicatorConfig>
  setIndicatorConfig: (address: string, config: IndicatorConfig) => void
  toggleOverlay: (address: string, overlay: ChartIndicatorOverlay) => void
  applyPreset: (address: string, preset: IndicatorPresetId) => void
  getConfigFor: (address: string) => IndicatorConfig
  hasSeenIntro: boolean
  dismissIntro: () => void
}

export const useChartUiStore = create<ChartUiState>((set, get) => ({
  indicatorConfigs: loadPersisted(),
  hasSeenIntro: loadIntroSeen(),
  setIndicatorConfig: (address, config) => {
    set((state) => {
      const indicatorConfigs = { ...state.indicatorConfigs, [address]: config }
      persist(indicatorConfigs)
      return { indicatorConfigs }
    })
  },
  toggleOverlay: (address, overlay) => {
    const current = get().indicatorConfigs[address]?.overlays ?? DEFAULT_OVERLAYS
    const exists = current.some((item) => JSON.stringify(item) === JSON.stringify(overlay))
    const nextOverlays = exists ? current.filter((item) => JSON.stringify(item) !== JSON.stringify(overlay)) : [...current, overlay]
    const preset: IndicatorPresetId = 'custom'
    get().setIndicatorConfig(address, { overlays: nextOverlays, preset })
  },
  applyPreset: (address, preset) => {
    let overlays: ChartIndicatorOverlay[] = []
    if (preset === 'scalper') {
      overlays = [
        { type: 'sma', period: 9 },
        { type: 'ema', period: 21 },
        { type: 'bb', period: 20, deviation: 2 },
      ]
    } else if (preset === 'swing') {
      overlays = [
        { type: 'sma', period: 20 },
        { type: 'ema', period: 50 },
        { type: 'bb', period: 20, deviation: 2 },
      ]
    } else if (preset === 'position') {
      overlays = [
        { type: 'sma', period: 50 },
        { type: 'ema', period: 200 },
      ]
    }
    get().setIndicatorConfig(address, { overlays, preset })
  },
  getConfigFor: (address) => {
    return get().indicatorConfigs[address] ?? { overlays: DEFAULT_OVERLAYS, preset: 'swing' }
  },
  dismissIntro: () => {
    persistIntroSeen(true)
    set({ hasSeenIntro: true })
  },
}))

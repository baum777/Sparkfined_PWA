import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChartTimeframe, IndicatorId, IndicatorPresetId } from '@/domain/chart'
import { loadIndicatorSettings, saveIndicatorSettings } from '@/db/indicatorSettings'
import {
  applyIndicatorPreset,
  createDefaultIndicatorSettings,
  indicatorSettingsToOverlays,
  toggleIndicatorEnabled,
  updateIndicatorParams,
} from '@/lib/indicatorSettings'

interface IndicatorSettingsState {
  isLoading: boolean
  error?: string
}

export function useIndicatorSettings(symbol: string, timeframe: ChartTimeframe) {
  const [settingsState, setSettingsState] = useState<IndicatorSettingsState>({ isLoading: true })
  const [settings, setSettings] = useState(() => createDefaultIndicatorSettings(symbol, timeframe))
  const settingsRef = useRef(settings)

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  useEffect(() => {
    let active = true
    const defaults = createDefaultIndicatorSettings(symbol, timeframe)
    settingsRef.current = defaults
    setSettings(defaults)
    setSettingsState({ isLoading: true })

    loadIndicatorSettings(symbol, timeframe)
      .then((next) => {
        if (!active) return
        setSettings(next)
        setSettingsState({ isLoading: false })
      })
      .catch((error) => {
        if (!active) return
        console.warn('[useIndicatorSettings] failed to load settings', error)
        setSettings(createDefaultIndicatorSettings(symbol, timeframe))
        setSettingsState({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to load settings' })
      })

    return () => {
      active = false
    }
  }, [symbol, timeframe])

  const persist = useCallback(
    async (updater: (current: typeof settingsRef.current) => typeof settingsRef.current) => {
      const base = settingsRef.current ?? createDefaultIndicatorSettings(symbol, timeframe)
      const next = updater(base)
      const saved = await saveIndicatorSettings(next)
      settingsRef.current = saved
      setSettings(saved)
      setSettingsState({ isLoading: false })
    },
    [symbol, timeframe]
  )

  const toggleIndicator = useCallback(
    async (indicatorId: IndicatorId, forced?: boolean) => {
      await persist((current) => toggleIndicatorEnabled(current, indicatorId, forced))
    },
    [persist]
  )

  const applyPreset = useCallback(
    async (preset: IndicatorPresetId) => {
      await persist((current) => applyIndicatorPreset(current, preset))
    },
    [persist]
  )

  const updateParamsFor = useCallback(
    async (indicatorId: IndicatorId, params: Record<string, number>) => {
      await persist((current) => updateIndicatorParams(current, indicatorId, params))
    },
    [persist]
  )

  const overlays = useMemo(() => indicatorSettingsToOverlays(settings), [settings])

  return {
    settings,
    overlays,
    isLoading: settingsState.isLoading,
    error: settingsState.error,
    toggleIndicator,
    applyPreset,
    updateParamsFor,
  }
}

export default useIndicatorSettings

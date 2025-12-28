import type {
  ChartIndicatorOverlay,
  ChartTimeframe,
  IndicatorEnabled,
  IndicatorId,
  IndicatorParams,
  IndicatorSettingsRecord,
  IndicatorPresetId,
} from '@/domain/chart'

export const DEFAULT_INDICATOR_ENABLED: IndicatorEnabled = {
  sma: false,
  ema: false,
  bb: false,
  rsi: false,
}

export const DEFAULT_INDICATOR_PARAMS: IndicatorParams = {
  sma: { period: 20 },
  ema: { period: 50 },
  bb: { period: 20, deviation: 2 },
  rsi: { period: 14, overbought: 70, oversold: 30 },
}

export function createDefaultIndicatorSettings(
  symbol: string,
  timeframe: ChartTimeframe,
  preset: IndicatorPresetId = 'custom'
): IndicatorSettingsRecord {
  const now = Date.now()
  return {
    symbol,
    timeframe,
    enabled: { ...DEFAULT_INDICATOR_ENABLED },
    params: { ...DEFAULT_INDICATOR_PARAMS },
    preset,
    createdAt: now,
    updatedAt: now,
  }
}

export function indicatorSettingsToOverlays(settings?: IndicatorSettingsRecord): ChartIndicatorOverlay[] {
  if (!settings) return []

  const overlays: ChartIndicatorOverlay[] = []
  const params = settings.params ?? {}
  const enabled = settings.enabled ?? DEFAULT_INDICATOR_ENABLED

  if (enabled.sma) {
    const { period = DEFAULT_INDICATOR_PARAMS.sma?.period ?? 20 } = params.sma ?? {}
    overlays.push({ type: 'sma', period })
  }

  if (enabled.ema) {
    const { period = DEFAULT_INDICATOR_PARAMS.ema?.period ?? 50 } = params.ema ?? {}
    overlays.push({ type: 'ema', period })
  }

  if (enabled.bb) {
    const {
      period = DEFAULT_INDICATOR_PARAMS.bb?.period ?? 20,
      deviation = DEFAULT_INDICATOR_PARAMS.bb?.deviation ?? 2,
    } = params.bb ?? {}
    overlays.push({ type: 'bb', period, deviation })
  }

  if (enabled.rsi) {
    const {
      period = DEFAULT_INDICATOR_PARAMS.rsi?.period ?? 14,
      overbought = DEFAULT_INDICATOR_PARAMS.rsi?.overbought ?? 70,
      oversold = DEFAULT_INDICATOR_PARAMS.rsi?.oversold ?? 30,
    } = params.rsi ?? {}
    overlays.push({ type: 'rsi', period, overbought, oversold })
  }

  return overlays
}

export function applyIndicatorPreset(
  settings: IndicatorSettingsRecord,
  preset: IndicatorPresetId
): IndicatorSettingsRecord {
  const baseParams: IndicatorParams = {
    ...DEFAULT_INDICATOR_PARAMS,
    ...settings.params,
  }

  if (preset === 'scalper') {
    return {
      ...settings,
      enabled: { ...DEFAULT_INDICATOR_ENABLED, sma: true, ema: true, bb: true },
      params: {
        ...baseParams,
        sma: { ...(baseParams.sma ?? {}), period: 9 },
        ema: { ...(baseParams.ema ?? {}), period: 21 },
        bb: { ...(baseParams.bb ?? {}), period: 20, deviation: 2 },
      },
      preset,
      updatedAt: Date.now(),
    }
  }

  if (preset === 'swing') {
    return {
      ...settings,
      enabled: { ...DEFAULT_INDICATOR_ENABLED, sma: true, ema: true, bb: true },
      params: {
        ...baseParams,
        sma: { ...(baseParams.sma ?? {}), period: 20 },
        ema: { ...(baseParams.ema ?? {}), period: 50 },
        bb: { ...(baseParams.bb ?? {}), period: 20, deviation: 2 },
      },
      preset,
      updatedAt: Date.now(),
    }
  }

  if (preset === 'position') {
    return {
      ...settings,
      enabled: { ...DEFAULT_INDICATOR_ENABLED, sma: true, ema: true },
      params: {
        ...baseParams,
        sma: { ...(baseParams.sma ?? {}), period: 50 },
        ema: { ...(baseParams.ema ?? {}), period: 200 },
      },
      preset,
      updatedAt: Date.now(),
    }
  }

  return {
    ...settings,
    preset,
    updatedAt: Date.now(),
  }
}

export function toggleIndicatorEnabled(
  settings: IndicatorSettingsRecord,
  indicatorId: IndicatorId,
  forced?: boolean
): IndicatorSettingsRecord {
  const enabled = settings.enabled ?? { ...DEFAULT_INDICATOR_ENABLED }
  const nextEnabled = { ...enabled, [indicatorId]: forced ?? !enabled[indicatorId] }

  return {
    ...settings,
    enabled: nextEnabled,
    preset: 'custom',
    updatedAt: Date.now(),
  }
}

export function updateIndicatorParams<K extends IndicatorId>(
  settings: IndicatorSettingsRecord,
  indicatorId: K,
  params: Partial<IndicatorParams[K]>
): IndicatorSettingsRecord {
  const nextParams: IndicatorParams = {
    ...DEFAULT_INDICATOR_PARAMS,
    ...settings.params,
  }

  const currentParams = (settings.params[indicatorId] ?? DEFAULT_INDICATOR_PARAMS[indicatorId]) as IndicatorParams[K]
  nextParams[indicatorId] = {
    ...currentParams,
    ...params,
  }

  return {
    ...settings,
    params: nextParams,
    updatedAt: Date.now(),
  }
}

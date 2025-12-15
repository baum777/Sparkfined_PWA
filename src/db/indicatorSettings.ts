import type { ChartTimeframe, IndicatorSettingsRecord } from '@/domain/chart'
import { createDefaultIndicatorSettings } from '@/lib/indicatorSettings'
import { boardDB } from '@/lib/db-board'

async function normalizeSettings(
  settings: IndicatorSettingsRecord
): Promise<IndicatorSettingsRecord> {
  const persisted: IndicatorSettingsRecord = {
    ...settings,
    createdAt: settings.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  }

  if (persisted.id) {
    await boardDB.indicatorSettings.update(persisted.id, persisted)
    return { ...persisted }
  }

  const id = await boardDB.indicatorSettings.add(persisted)
  return { ...persisted, id }
}

export async function loadIndicatorSettings(
  symbol: string,
  timeframe: ChartTimeframe
): Promise<IndicatorSettingsRecord> {
  const existing = await boardDB.indicatorSettings
    .where('[symbol+timeframe]')
    .equals([symbol, timeframe])
    .first()

  if (existing) {
    return existing
  }

  const defaults = createDefaultIndicatorSettings(symbol, timeframe)
  const id = await boardDB.indicatorSettings.add(defaults)
  return { ...defaults, id }
}

export async function saveIndicatorSettings(
  settings: IndicatorSettingsRecord
): Promise<IndicatorSettingsRecord> {
  return normalizeSettings(settings)
}

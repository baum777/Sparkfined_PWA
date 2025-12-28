import type { OHLCSeries } from '@/lib/types/ohlc'
import type { Signal, SignalRule } from '@/lib/signalDb'

export interface VolumeSpikeParams {
  lookbackPeriods: number
  spikeMultiplier: number
}

const defaultVolumeSpikeParams: VolumeSpikeParams = {
  lookbackPeriods: 20,
  spikeMultiplier: 2,
}

const resolveVolumeParams = (rule: SignalRule): VolumeSpikeParams => {
  const params = rule.params
  const lookback = typeof params.lookbackPeriods === 'number'
    ? params.lookbackPeriods
    : defaultVolumeSpikeParams.lookbackPeriods
  const spikeMultiplier = typeof params.spikeMultiplier === 'number'
    ? params.spikeMultiplier
    : defaultVolumeSpikeParams.spikeMultiplier

  return { lookbackPeriods: lookback, spikeMultiplier }
}

const createSignalId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function detectVolumeSpike(series: OHLCSeries, rule: SignalRule): Signal | null {
  const params = resolveVolumeParams(rule)
  const { points } = series

  if (points.length <= params.lookbackPeriods) {
    return null
  }

  const last = points.at(-1)
  if (!last) {
    return null
  }
  if (typeof last.volume !== 'number') {
    return null
  }

  const lookbackSlice = points.slice(-1 - params.lookbackPeriods, -1)
  const lookbackWithVolume = lookbackSlice.filter((point) => typeof point.volume === 'number')
  if (lookbackWithVolume.length === 0) {
    return null
  }

  const totalVolume = lookbackWithVolume.reduce((sum, point) => sum + (point.volume ?? 0), 0)
  const averageVolume = totalVolume / lookbackWithVolume.length

  if (averageVolume === 0 || last.volume <= params.spikeMultiplier * averageVolume) {
    return null
  }

  return {
    id: createSignalId('sig'),
    symbol: series.symbol,
    ruleId: rule.id,
    type: 'volumeSpike',
    triggeredAt: new Date(last.timestamp).toISOString(),
    meta: {
      price: last.close,
      timeframe: series.timeframe,
      lookbackPeriods: params.lookbackPeriods,
      spikeMultiplier: params.spikeMultiplier,
      volume: last.volume,
      averageVolume,
    },
  }
}

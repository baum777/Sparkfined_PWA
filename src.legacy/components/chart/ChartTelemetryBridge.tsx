import { useEffect } from 'react'
import type { ChartMode, ChartTimeframe } from '@/domain/chart'
import type { ChartTelemetryEventName, ChartTelemetryPayloads } from '@/domain/telemetry'
import { useChartTelemetry } from '@/lib/chartTelemetry'

export type ChartTrack = <N extends ChartTelemetryEventName>(type: N, payload: ChartTelemetryPayloads[N]) => void

type ChartTelemetryBridgeProps = {
  address: string
  timeframe: ChartTimeframe
  mode: ChartMode | 'chart'
  onReady: (track: ChartTrack) => void
}

export default function ChartTelemetryBridge({ address, timeframe, mode, onReady }: ChartTelemetryBridgeProps) {
  const { track } = useChartTelemetry()
  const telemetryMode: 'chart' | 'replay' = mode === 'replay' ? 'replay' : 'chart'

  useEffect(() => {
    onReady(track)
  }, [onReady, track])

  useEffect(() => {
    track('chart.view_opened', { address, timeframe, mode: telemetryMode })
  }, [address, telemetryMode, timeframe, track])

  return null
}

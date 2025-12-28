import { useCallback } from 'react'
import type { ChartTelemetryEvent, ChartTelemetryEventName, ChartTelemetryPayloads } from '@/domain/telemetry'
import type { TelemetryEvent } from '@/state/telemetry'
import { useTelemetry } from '@/state/telemetry'

const randomId = () =>
  (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `chart-${Math.random().toString(16).slice(2)}`)

export function emitChartEvent(event: ChartTelemetryEvent, enqueue: (ev: TelemetryEvent) => void) {
  enqueue({ id: randomId(), ts: Date.now(), type: event.type, attrs: event.payload })
}

export function useChartTelemetry() {
  const telemetry = useTelemetry()

  const track = useCallback(
    <N extends ChartTelemetryEventName>(type: N, payload: ChartTelemetryPayloads[N]) => {
      emitChartEvent({ type, payload }, telemetry.enqueue)
    },
    [telemetry]
  )

  return { track }
}

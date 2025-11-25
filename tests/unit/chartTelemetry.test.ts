import { describe, expect, it, vi } from 'vitest'
import { emitChartEvent } from '@/lib/chartTelemetry'
import type { ChartTelemetryEvent } from '@/domain/telemetry'

const baseEvent: ChartTelemetryEvent = {
  type: 'chart.view_opened',
  payload: { timeframe: '1h', address: 'addr', mode: 'chart' },
}

describe('emitChartEvent', () => {
  it('forwards telemetry events with payload', () => {
    const enqueue = vi.fn()
    emitChartEvent(baseEvent, enqueue)

    expect(enqueue).toHaveBeenCalledTimes(1)
    const payload = enqueue.mock.calls[0][0]
    expect(payload.type).toBe('chart.view_opened')
    expect(payload.attrs).toMatchObject({ timeframe: '1h', address: 'addr', mode: 'chart' })
    expect(payload.id).toBeTruthy()
    expect(typeof payload.ts).toBe('number')
  })
})

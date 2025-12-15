import type { ChartIndicatorOverlay, ChartTimeframe, IndicatorId, IndicatorPresetId } from './chart'

export type ChartTelemetryEventName =
  | 'chart.view_opened'
  | 'chart.indicator_preset_selected'
  | 'chart.indicator_toggled'
  | 'chart.indicator_param_changed'
  | 'chart.replay_started'
  | 'chart.replay_stopped'
  | 'chart.replay_go_live'
  | 'chart.annotation_jump'
  | 'chart.journal_created_from_chart'
  | 'chart.alert_created_from_chart'
  | 'chart.pulse_signal_viewed_in_chart'

export type ChartTelemetryPayloads = {
  'chart.view_opened': { address?: string; timeframe: ChartTimeframe; mode?: 'chart' | 'replay' }
  'chart.indicator_preset_selected': { presetId: IndicatorPresetId; address?: string; timeframe: ChartTimeframe }
  'chart.indicator_toggled': {
    indicator: ChartIndicatorOverlay
    active: boolean
    address?: string
    timeframe: ChartTimeframe
  }
  'chart.indicator_param_changed': {
    indicator: IndicatorId
    key: string
    value: number
    address?: string
    timeframe: ChartTimeframe
  }
  'chart.replay_started': { address?: string; timeframe: ChartTimeframe }
  'chart.replay_stopped': { address?: string; timeframe: ChartTimeframe }
  'chart.replay_go_live': { address?: string; timeframe: ChartTimeframe }
  'chart.annotation_jump': { address?: string; timeframe: ChartTimeframe; kind: 'journal' | 'alert' | 'signal' }
  'chart.journal_created_from_chart': { address?: string; timeframe: ChartTimeframe }
  'chart.alert_created_from_chart': { address?: string; timeframe: ChartTimeframe }
  'chart.pulse_signal_viewed_in_chart': { address?: string; timeframe: ChartTimeframe; pulseId?: string }
}

export type ChartTelemetryEvent<N extends ChartTelemetryEventName = ChartTelemetryEventName> = {
  type: N
  payload: ChartTelemetryPayloads[N]
}

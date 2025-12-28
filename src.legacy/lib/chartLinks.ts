import type { ChartTimeframe } from '@/domain/chart'

export type ChartLinkOptions = { from?: number; to?: number }

export function buildChartUrl(address: string, timeframe?: ChartTimeframe, opts: ChartLinkOptions = {}): string {
  const params = new URLSearchParams()
  params.set('address', address)
  if (timeframe) params.set('timeframe', timeframe)
  if (opts.from) params.set('from', String(opts.from))
  if (opts.to) params.set('to', String(opts.to))
  // Keep legacy /chart-v2 link format (router preserves search and redirects to /chart).
  return `/chart-v2?${params.toString()}`
}

export function buildReplayUrl(
  address: string,
  timeframe: ChartTimeframe,
  from: number,
  to: number,
  extra?: Record<string, string | number>
): string {
  const params = new URLSearchParams({ address, timeframe, from: String(from), to: String(to) })
  Object.entries(extra ?? {}).forEach(([key, value]) => params.set(key, String(value)))
  return `/replay?${params.toString()}`
}

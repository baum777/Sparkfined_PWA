import type { Page, Route } from '@playwright/test'

type ReplayOhlcPoint = {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/**
 * Centralized E2E API stubs.
 *
 * NOTE:
 * Base `/api/*` stubbing lives in `tests/e2e/fixtures/baseTest.ts` via
 * `tests/e2e/fixtures/api-stubs.ts`. This file is the shared entrypoint for
 * additional per-domain stubs so specs don't carry bespoke `/api/*` workarounds.
 */

export async function stubReplayMarketOhlc(
  page: Page,
  points?: ReplayOhlcPoint[],
): Promise<void> {
  const context = page.context()

  const defaultPoints: ReplayOhlcPoint[] = [
    { time: 1701388800, open: 95, high: 98, low: 94, close: 97, volume: 1000 },
    { time: 1701392400, open: 97, high: 102, low: 96, close: 101, volume: 1200 },
    { time: 1701396000, open: 101, high: 105, low: 100, close: 103, volume: 1100 },
    { time: 1701399600, open: 103, high: 106, low: 101, close: 104, volume: 1300 },
    { time: 1701403200, open: 104, high: 108, low: 103, close: 107, volume: 1400 },
  ]

  await context.route('**/api/market/ohlc**', (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        symbol: 'SOL',
        timeframe: '1h',
        data: points ?? defaultPoints,
      }),
    }),
  )
}


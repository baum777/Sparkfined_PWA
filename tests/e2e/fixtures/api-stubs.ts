import type { Page, Route } from '@playwright/test';

const TOKEN_BASELINE_BY_ADDRESS: Record<string, number> = {
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 43280, // BTC
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 2320, // ETH
  'So11111111111111111111111111111111111111112': 98.42, // SOL
  '0x4200000000000000000000000000000000000042': 3.12, // OP
  '0x514910771af9ca656af840dff83e8264ecf986ca': 19.44, // LINK
  '0x912ce59144191c1204f64559fe8253a0e49e6548': 1.98, // ARB
  '0x2261daa3a42d3a7c2717b1b0ce68b6310c47fe0a': 13.55, // TIA
};

const DEFAULT_BASELINE_PRICE = 25;
const FIXTURE_POINTS = 25;
const MINUTE = 60 * 1000;
const FIXTURE_START = 1_700_000_000_000; // deterministic timestamp for reproducibility

type FixturePoint = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

function buildDeterministicSeries(basePrice: number): FixturePoint[] {
  const points: FixturePoint[] = [];

  for (let i = 0; i < FIXTURE_POINTS; i += 1) {
    const offset = FIXTURE_POINTS - i;
    const jitter = (offset % 5) * 0.5;
    const open = basePrice + jitter;
    const close = basePrice + Math.sin(i / 3) * 2;
    const high = Math.max(open, close) + 0.75;
    const low = Math.min(open, close) - 0.75;

    points.push({
      time: Math.floor((FIXTURE_START - offset * MINUTE) / 1000),
      open,
      high,
      low,
      close,
      volume: 1_000 + i * 25,
    });
  }

  return points;
}

function resolveBaselineFromRequest(url: string): number {
  try {
    const parsed = new URL(url);
    const address = parsed.searchParams.get('address');
    if (address && TOKEN_BASELINE_BY_ADDRESS[address]) {
      return TOKEN_BASELINE_BY_ADDRESS[address];
    }
  } catch {
    // ignore parse errors and fall back to default
  }
  return DEFAULT_BASELINE_PRICE;
}

async function fulfillWithOhlc(route: Route, basePrice: number) {
  const payload = { result: buildDeterministicSeries(basePrice) };
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  });
}

/**
 * Stub noisy API endpoints that aren't needed for E2E tests
 * and provide deterministic fixtures so UI logic behaves predictably.
 */
export async function stubNoisyAPIs(page: Page): Promise<void> {
  // Stub telemetry - not needed for functional tests
  await page.route('**/api/telemetry', (route) =>
    route.fulfill({
      status: 204,
      body: '',
    }),
  );

  // Stub Moralis proxy with deterministic OHLC data
  await page.route('**/api/moralis/**', (route) => {
    const basePrice = resolveBaselineFromRequest(route.request().url());
    return fulfillWithOhlc(route, basePrice);
  });

  // Stub DexPaprika upstream to avoid hitting the live API in CI
  await page.route('https://api.dexpaprika.com/**', (route) => {
    const basePrice = resolveBaselineFromRequest(route.request().url());
    return fulfillWithOhlc(route, basePrice);
  });

  // Stub other data APIs that might cause noise
  await page.route('**/api/data/**', (route) =>
    route.continue().catch(() =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: null, cached: true }),
      }),
    ),
  );
}

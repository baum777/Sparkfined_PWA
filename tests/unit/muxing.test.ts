/**
 * Alpha Issue 4: Provider Muxing + SWR Cache
 * Tests for provider fallback logic
 */

import { describe, it } from 'vitest';

describe('Provider Muxing', () => {
  it.skip('uses primary provider when available', async () => {
    // TODO: Mock primary provider success
    // const result = await getTokenSnapshot('So11111111111111111111111111111111111111112');
    // expect(result.meta.provider).toBe('dexpaprika');
    // expect(result.meta.fallback).toBe(false);
  });

  it.skip('falls back to secondary on primary error', async () => {
    // TODO: Mock primary fail, secondary success
    // const result = await getTokenSnapshot('So11111111111111111111111111111111111111112');
    // expect(result.meta.provider).toBe('moralis');
    // expect(result.meta.fallback).toBe(true);
  });

  it.skip('caches results for 300s', async () => {
    // TODO: Test cache hit/miss
  });

  it.skip('emits telemetry events', async () => {
    // TODO: Test telemetry logging
  });
});

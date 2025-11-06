/**
 * Alpha Issue 1: Edge Proxies
 * Integration tests for API proxy routes
 *
 * NOTE: These tests require mock service worker (msw) or similar
 */

import { describe, it, expect as _expect } from 'vitest';
import { fetchWithTimeout } from '@/lib/net/withTimeout';

// Redefine for active tests only
const expect = _expect;

describe('API Proxy Integration', () => {
  it.skip('proxies DexPaprika requests', async () => {
    // TODO: Implement with msw mock
    // const response = await fetch('/api/dexpaprika/tokens/So11111111111111111111111111111111111111112');
    // expect(response.ok).toBe(true);
    // const data = await response.json();
    // expect(data.provider).toBe('dexpaprika');
  });

  it.skip('proxies Moralis requests', async () => {
    // TODO: Implement with msw mock
    // const response = await fetch('/api/moralis/token/So11111111111111111111111111111111111111112');
    // expect(response.ok).toBe(true);
    // const data = await response.json();
    // expect(data.provider).toBe('moralis');
  });

  it('handles timeout correctly', async () => {
    // Mock a slow fetch that will timeout
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() => 
      new Promise(resolve => setTimeout(resolve, 2000))
    ) as typeof fetch;

    await expect(
      fetchWithTimeout('http://example.com', {}, 100, 0)
    ).rejects.toThrow();

    // Restore
    globalThis.fetch = originalFetch;
  });
});

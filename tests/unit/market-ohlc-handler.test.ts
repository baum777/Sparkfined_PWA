import { describe, it, expect, beforeEach, vi } from 'vitest';
import handler from '../../api/market/ohlc';
import { getFallbackCounters, resetFallbackCounters } from '../../src/lib/metrics/providerFallback';

function createReq(overrides: Partial<any> = {}) {
  return {
    query: { address: 'So11111111111111111111111111111111111111112', tf: '15m', ...overrides.query },
    headers: { host: 'localhost:3000', ...overrides.headers },
  } as any;
}

function createRes() {
  let statusCode = 200;
  const headers: Record<string, string> = {};
  let body: any;
  return {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: any) {
      body = payload;
      return payload;
    },
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value;
    },
    get statusCode() {
      return statusCode;
    },
    get body() {
      return body;
    },
    get headers() {
      return headers;
    },
  } as any;
}

beforeEach(() => {
  vi.restoreAllMocks();
  resetFallbackCounters();
});

describe('api/market/ohlc handler', () => {
  it('returns data from DexPaprika when available', async () => {
    const req = createReq();
    const res = createRes();

    const dexResponse = {
      ok: true,
      json: async () => ({ data: [[1700000000, 1, 2, 0.5, 1.5, 1000]] }),
    } as any;

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(dexResponse);

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.ohlc)).toBe(true);
    expect(res.body.ohlc[0]).toMatchObject({ t: 1700000000, o: 1, h: 2, l: 0.5, c: 1.5 });
    expect(getFallbackCounters()).toStrictEqual({});
  });

  it('falls back to Moralis proxy when DexPaprika fails', async () => {
    const req = createReq();
    const res = createRes();

    const fetchMock = vi.spyOn(global, 'fetch');
    fetchMock
      .mockRejectedValueOnce(new Error('network error'))
      .mockRejectedValueOnce(new Error('network error 2'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, data: [{ t: 1700000000, o: 1, h: 2, l: 0.5, c: 1.5 }] }),
      } as any);

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.ohlc[0]).toMatchObject({ t: 1700000000, o: 1, h: 2, l: 0.5, c: 1.5 });
    expect(getFallbackCounters().moralis).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

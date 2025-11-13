/**
 * Tests for Board Feed API Endpoint
 *
 * Tests:
 * - Successful response with feed data
 * - Pagination (limit, offset)
 * - Type filtering (all, alerts, journal, etc.)
 * - Response structure
 * - Cache headers
 * - Error handling
 */

import { describe, it, expect } from 'vitest';
import handler from '@/../../api/board/feed';

describe('Board Feed API', () => {
  it('returns successful response with feed data', async () => {
    const request = new Request('http://localhost/api/board/feed');

    const response = await handler(request);

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data).toMatchObject({
      ok: true,
      data: expect.any(Array),
      total: expect.any(Number),
      limit: expect.any(Number),
      offset: expect.any(Number),
      timestamp: expect.any(Number),
    });
  });

  it('returns feed events with required fields', async () => {
    const request = new Request('http://localhost/api/board/feed');

    const response = await handler(request);
    const data = await response.json();

    expect(data.data.length).toBeGreaterThan(0);

    const firstEvent = data.data[0];

    expect(firstEvent).toMatchObject({
      id: expect.any(String),
      type: expect.stringMatching(/^(alert|analysis|journal|export|error)$/),
      text: expect.any(String),
      timestamp: expect.any(Number),
      unread: expect.any(Boolean),
    });
  });

  it('respects default limit of 20', async () => {
    const request = new Request('http://localhost/api/board/feed');

    const response = await handler(request);
    const data = await response.json();

    expect(data.limit).toBe(20);
  });

  it('respects custom limit parameter', async () => {
    const request = new Request('http://localhost/api/board/feed?limit=5');

    const response = await handler(request);
    const data = await response.json();

    expect(data.limit).toBe(5);
    expect(data.data.length).toBeLessThanOrEqual(5);
  });

  it('enforces maximum limit of 100', async () => {
    const request = new Request('http://localhost/api/board/feed?limit=999');

    const response = await handler(request);
    const data = await response.json();

    expect(data.limit).toBe(100);
  });

  it('respects offset parameter', async () => {
    const request1 = new Request('http://localhost/api/board/feed?limit=2&offset=0');
    const request2 = new Request('http://localhost/api/board/feed?limit=2&offset=2');

    const response1 = await handler(request1);
    const response2 = await handler(request2);

    const data1 = await response1.json();
    const data2 = await response2.json();

    expect(data1.offset).toBe(0);
    expect(data2.offset).toBe(2);

    // Should return different events
    expect(data1.data[0]?.id).not.toBe(data2.data[0]?.id);
  });

  it('filters by type: alerts', async () => {
    const request = new Request('http://localhost/api/board/feed?type=alerts');

    const response = await handler(request);
    const data = await response.json();

    expect(data.data.every((event: any) => event.type === 'alert')).toBe(true);
  });

  it('filters by type: journal', async () => {
    const request = new Request('http://localhost/api/board/feed?type=journal');

    const response = await handler(request);
    const data = await response.json();

    // Journal type includes both 'journal' and 'analysis' events
    expect(
      data.data.every(
        (event: any) => event.type === 'journal' || event.type === 'analysis'
      )
    ).toBe(true);
  });

  it('filters by type: analysis', async () => {
    const request = new Request('http://localhost/api/board/feed?type=analysis');

    const response = await handler(request);
    const data = await response.json();

    expect(data.data.every((event: any) => event.type === 'analysis')).toBe(true);
  });

  it('filters by type: export', async () => {
    const request = new Request('http://localhost/api/board/feed?type=export');

    const response = await handler(request);
    const data = await response.json();

    expect(data.data.every((event: any) => event.type === 'export')).toBe(true);
  });

  it('filters by type: error', async () => {
    const request = new Request('http://localhost/api/board/feed?type=error');

    const response = await handler(request);
    const data = await response.json();

    expect(data.data.every((event: any) => event.type === 'error')).toBe(true);
  });

  it('returns all events when type is "all"', async () => {
    const request = new Request('http://localhost/api/board/feed?type=all');

    const response = await handler(request);
    const data = await response.json();

    const eventTypes = data.data.map((event: any) => event.type);
    const uniqueTypes = [...new Set(eventTypes)];

    // Should have multiple event types
    expect(uniqueTypes.length).toBeGreaterThan(1);
  });

  it('includes metadata for alert events', async () => {
    const request = new Request('http://localhost/api/board/feed?type=alerts');

    const response = await handler(request);
    const data = await response.json();

    if (data.data.length > 0) {
      const alertEvent = data.data[0];

      expect(alertEvent.metadata).toBeDefined();
      expect(alertEvent.metadata.symbol).toBeDefined();
      expect(alertEvent.metadata.alertId).toBeDefined();
    }
  });

  it('includes metadata for analysis events', async () => {
    const request = new Request('http://localhost/api/board/feed?type=analysis');

    const response = await handler(request);
    const data = await response.json();

    if (data.data.length > 0) {
      const analysisEvent = data.data[0];

      expect(analysisEvent.metadata).toBeDefined();
      expect(analysisEvent.metadata.symbol).toBeDefined();
      expect(analysisEvent.metadata.timeframe).toBeDefined();
    }
  });

  it('includes metadata for journal events', async () => {
    const request = new Request('http://localhost/api/board/feed?type=journal');

    const response = await handler(request);
    const data = await response.json();

    const journalEvents = data.data.filter((event: any) => event.type === 'journal');

    if (journalEvents.length > 0) {
      const journalEvent = journalEvents[0];

      expect(journalEvent.metadata).toBeDefined();
      expect(journalEvent.metadata.pnl).toBeDefined();
    }
  });

  it('sets correct cache headers', async () => {
    const request = new Request('http://localhost/api/board/feed');

    const response = await handler(request);

    const cacheControl = response.headers.get('Cache-Control');

    expect(cacheControl).toBeTruthy();
    expect(cacheControl).toContain('s-maxage=10');
    expect(cacheControl).toContain('stale-while-revalidate=30');
  });

  it('sets correct content type', async () => {
    const request = new Request('http://localhost/api/board/feed');

    const response = await handler(request);

    const contentType = response.headers.get('Content-Type');

    expect(contentType).toBe('application/json');
  });

  it('returns total count of filtered events', async () => {
    const request = new Request('http://localhost/api/board/feed?type=alerts');

    const response = await handler(request);
    const data = await response.json();

    // Total should match the number of alert events
    expect(data.total).toBeGreaterThanOrEqual(data.data.length);
  });

  it('handles pagination correctly', async () => {
    const request = new Request('http://localhost/api/board/feed?limit=3&offset=1');

    const response = await handler(request);
    const data = await response.json();

    expect(data.data.length).toBeLessThanOrEqual(3);
    expect(data.offset).toBe(1);
    expect(data.limit).toBe(3);
  });

  it('includes timestamp in response', async () => {
    const before = Date.now();

    const request = new Request('http://localhost/api/board/feed');
    const response = await handler(request);
    const data = await response.json();

    const after = Date.now();

    expect(data.timestamp).toBeGreaterThanOrEqual(before);
    expect(data.timestamp).toBeLessThanOrEqual(after);
  });

  it('events are sorted by timestamp descending', async () => {
    const request = new Request('http://localhost/api/board/feed');

    const response = await handler(request);
    const data = await response.json();

    if (data.data.length > 1) {
      const timestamps = data.data.map((event: any) => event.timestamp);

      for (let i = 0; i < timestamps.length - 1; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
      }
    }
  });
});

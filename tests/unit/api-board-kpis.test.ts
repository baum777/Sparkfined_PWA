/**
 * Tests for Board KPIs API Endpoint
 *
 * Tests:
 * - Successful response with KPI data
 * - Response structure and types
 * - Cache headers
 * - Error handling
 */

import { describe, it, expect } from 'vitest';
import handler from '@/../../api/board/kpis';

describe('Board KPIs API', () => {
  it('returns successful response with KPI data', async () => {
    const request = new Request('http://localhost/api/board/kpis');

    const response = await handler(request);

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data).toMatchObject({
      ok: true,
      timestamp: expect.any(Number),
    });

    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('returns all expected KPIs', async () => {
    const request = new Request('http://localhost/api/board/kpis');

    const response = await handler(request);
    const data = await response.json();

    expect(data.data).toHaveLength(7);

    const kpiIds = data.data.map((kpi: any) => kpi.id);

    expect(kpiIds).toContain('pnl-today');
    expect(kpiIds).toContain('active-alerts');
    expect(kpiIds).toContain('active-charts');
    expect(kpiIds).toContain('sentiment');
    expect(kpiIds).toContain('risk-score');
    expect(kpiIds).toContain('journal-entries');
    expect(kpiIds).toContain('sync-status');
  });

  it('includes required KPI fields', async () => {
    const request = new Request('http://localhost/api/board/kpis');

    const response = await handler(request);
    const data = await response.json();

    const firstKpi = data.data[0];

    expect(firstKpi).toMatchObject({
      id: expect.any(String),
      label: expect.any(String),
      value: expect.anything(), // Can be string or number
      type: expect.stringMatching(/^(numeric|count|status|timestamp)$/),
    });
  });

  it('includes optional KPI fields when present', async () => {
    const request = new Request('http://localhost/api/board/kpis');

    const response = await handler(request);
    const data = await response.json();

    // Find KPI with direction
    const kpiWithDirection = data.data.find((kpi: any) => kpi.direction);
    expect(kpiWithDirection).toBeDefined();
    expect(kpiWithDirection.direction).toMatch(/^(up|down|neutral)$/);

    // Find KPI with trend
    const kpiWithTrend = data.data.find((kpi: any) => kpi.trend);
    expect(kpiWithTrend).toBeDefined();
    expect(kpiWithTrend.trend).toBeTruthy();

    // Find KPI with icon
    const kpiWithIcon = data.data.find((kpi: any) => kpi.icon);
    expect(kpiWithIcon).toBeDefined();
    expect(kpiWithIcon.icon).toMatch(/^(alert|chart|journal|sync|time)$/);
  });

  it('sets correct cache headers', async () => {
    const request = new Request('http://localhost/api/board/kpis');

    const response = await handler(request);

    const cacheControl = response.headers.get('Cache-Control');

    expect(cacheControl).toBeTruthy();
    expect(cacheControl).toContain('s-maxage=30');
    expect(cacheControl).toContain('stale-while-revalidate=60');
  });

  it('sets correct content type', async () => {
    const request = new Request('http://localhost/api/board/kpis');

    const response = await handler(request);

    const contentType = response.headers.get('Content-Type');

    expect(contentType).toBe('application/json');
  });

  it('includes timestamp in response', async () => {
    const before = Date.now();

    const request = new Request('http://localhost/api/board/kpis');
    const response = await handler(request);
    const data = await response.json();

    const after = Date.now();

    expect(data.timestamp).toBeGreaterThanOrEqual(before);
    expect(data.timestamp).toBeLessThanOrEqual(after);
  });

  it('returns numeric KPIs with correct type', async () => {
    const request = new Request('http://localhost/api/board/kpis');

    const response = await handler(request);
    const data = await response.json();

    const pnlKpi = data.data.find((kpi: any) => kpi.id === 'pnl-today');

    expect(pnlKpi).toBeDefined();
    expect(pnlKpi.type).toBe('numeric');
    expect(typeof pnlKpi.value).toBe('string'); // Formatted as currency
    expect(pnlKpi.direction).toBeTruthy();
  });

  it('returns count KPIs with correct type', async () => {
    const request = new Request('http://localhost/api/board/kpis');

    const response = await handler(request);
    const data = await response.json();

    const alertsKpi = data.data.find((kpi: any) => kpi.id === 'active-alerts');

    expect(alertsKpi).toBeDefined();
    expect(alertsKpi.type).toBe('count');
    expect(typeof alertsKpi.value).toBe('number');
    expect(alertsKpi.icon).toBe('alert');
  });

  it('returns status KPIs with correct type', async () => {
    const request = new Request('http://localhost/api/board/kpis');

    const response = await handler(request);
    const data = await response.json();

    const syncKpi = data.data.find((kpi: any) => kpi.id === 'sync-status');

    expect(syncKpi).toBeDefined();
    expect(syncKpi.type).toBe('status');
    expect(typeof syncKpi.value).toBe('string');
    expect(syncKpi.timestamp).toBeDefined();
  });
});

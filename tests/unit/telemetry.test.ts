/**
 * Alpha Issue 12: Performance & Telemetry
 * Tests for telemetry service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Telemetry, TelemetryEvents } from '@/lib/TelemetryService';

describe('Telemetry Service', () => {
  beforeEach(() => {
    Telemetry.clear();
  });

  it('records teaser timing', () => {
    Telemetry.log(TelemetryEvents.AI_TEASER_MS, 1200);

    const dump = Telemetry.dump();
    expect(dump.events.length).toBeGreaterThan(0);
    expect(dump.events[0]?.name).toBe(TelemetryEvents.AI_TEASER_MS);
    expect(dump.events[0]?.value).toBe(1200);
  });

  it('calculates performance statistics', () => {
    // Log multiple events
    [100, 200, 300, 400, 500].forEach(val =>
      Telemetry.log(TelemetryEvents.API_REQUEST_MS, val)
    );

    const stats = Telemetry.getStats(TelemetryEvents.API_REQUEST_MS);
    expect(stats).toBeTruthy();
    expect(stats!.count).toBe(5);
    expect(stats!.median).toBe(300);
    expect(stats!.max).toBe(500);
  });

  it('checks performance budgets', () => {
    Telemetry.registerBudget({
      name: TelemetryEvents.AI_TEASER_MS,
      budgetMs: 2000,
    });

    expect(Telemetry.checkBudget(TelemetryEvents.AI_TEASER_MS, 1500)).toBe(true);
    expect(Telemetry.checkBudget(TelemetryEvents.AI_TEASER_MS, 2500)).toBe(false);
  });

  it('exports to CSV format', () => {
    Telemetry.log(TelemetryEvents.API_REQUEST_MS, 250);

    const csv = Telemetry.exportCSV();
    expect(csv).toContain('name,value,timestamp');
    expect(csv).toContain(TelemetryEvents.API_REQUEST_MS);
    expect(csv).toContain('250');
  });

  it('limits event storage to 1000 events', () => {
    // Log 1100 events
    for (let i = 0; i < 1100; i++) {
      Telemetry.log('test_event', i);
    }

    const dump = Telemetry.dump();
    expect(dump.events.length).toBeLessThanOrEqual(1000);
  });
});

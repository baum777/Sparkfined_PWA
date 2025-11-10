/**
 * Unit Tests: Crosshair Aggregator
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CrosshairAggregator } from '@/lib/analytics/crosshair-aggregator';

describe('CrosshairAggregator', () => {
  let sendFn: ReturnType<typeof vi.fn<any[], Promise<void>>>;
  let aggregator: CrosshairAggregator;

  beforeEach(() => {
    sendFn = vi.fn<any[], Promise<void>>().mockResolvedValue(undefined);

    aggregator = new CrosshairAggregator(sendFn as any, {
      windowMs: 100, // Short window for tests
      fullStreamPct: 1,
      userBucketVal: 50, // In 1% sample
      sessionId: 'test-session-123',
      clientVersion: '1.0.0-test',
      enableHeatmap: false,
      heatmapGridSize: 50
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('record', () => {
    it('should buffer events without immediate send', () => {
      aggregator.record(Date.now(), 49000, 'BTC/USDT');
      aggregator.record(Date.now(), 49100, 'BTC/USDT');

      expect(sendFn).not.toHaveBeenCalled();
    });

    it('should increment metrics', () => {
      aggregator.record(Date.now(), 49000, 'BTC/USDT');
      aggregator.record(Date.now(), 49100, 'BTC/USDT');

      const metrics = aggregator.getMetrics();
      expect(metrics.recorded).toBe(2);
    });
  });

  describe('flush', () => {
    it('should flush after window period', async () => {
      aggregator.record(Date.now(), 49000, 'BTC/USDT');
      aggregator.record(Date.now(), 49100, 'BTC/USDT');

      // Wait for window + buffer
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(sendFn).toHaveBeenCalledTimes(1);
    });

    it('should include correct count', async () => {
      aggregator.record(Date.now(), 49000, 'BTC/USDT');
      aggregator.record(Date.now(), 49100, 'BTC/USDT');
      aggregator.record(Date.now(), 49200, 'BTC/USDT');

      await aggregator.flush();

      expect(sendFn).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'chart.crosshair_agg',
          count: 3,
          symbol: 'BTC/USDT'
        })
      );
    });

    it('should calculate min/max/avg price', async () => {
      aggregator.record(Date.now(), 49000, 'BTC/USDT');
      aggregator.record(Date.now(), 50000, 'BTC/USDT');
      aggregator.record(Date.now(), 49500, 'BTC/USDT');

      await aggregator.flush();

      expect(sendFn).toHaveBeenCalledWith(
        expect.objectContaining({
          min_price: 49000,
          max_price: 50000,
          avg_price: 49500
        })
      );
    });

    it('should include last time and price', async () => {
      const time1 = Date.now();
      const time2 = time1 + 1000;

      aggregator.record(time1, 49000, 'BTC/USDT');
      aggregator.record(time2, 49100, 'BTC/USDT');

      await aggregator.flush();

      expect(sendFn).toHaveBeenCalledWith(
        expect.objectContaining({
          last_price: 49100,
          last_time: new Date(time2).toISOString()
        })
      );
    });

    it('should reset buffer after flush', async () => {
      aggregator.record(Date.now(), 49000, 'BTC/USDT');
      await aggregator.flush();

      aggregator.record(Date.now(), 50000, 'BTC/USDT');
      await aggregator.flush();

      expect(sendFn).toHaveBeenCalledTimes(2);

      // Second call should have count=1
      expect(sendFn).toHaveBeenNthCalledWith(2,
        expect.objectContaining({ count: 1 })
      );
    });

    it('should not flush empty buffer', async () => {
      await aggregator.flush();
      expect(sendFn).not.toHaveBeenCalled();
    });
  });

  describe('sampling rate', () => {
    it('should calculate correct sampling rate for full-stream user', async () => {
      const fullStreamAgg = new CrosshairAggregator(sendFn as any, {
        windowMs: 100,
        fullStreamPct: 1,
        userBucketVal: 50, // 50 < 100 (1% threshold)
        sessionId: 'test',
        clientVersion: '1.0.0',
        enableHeatmap: false,
        heatmapGridSize: 50
      });

      fullStreamAgg.record(Date.now(), 49000, 'BTC/USDT');
      await fullStreamAgg.flush();

      expect(sendFn).toHaveBeenCalledWith(
        expect.objectContaining({ sampling_rate: 1 })
      );
    });

    it('should calculate correct sampling rate for sampled user', async () => {
      const sampledAgg = new CrosshairAggregator(sendFn as any, {
        windowMs: 100,
        fullStreamPct: 1,
        userBucketVal: 5000, // 5000 > 100 (1% threshold)
        sessionId: 'test',
        clientVersion: '1.0.0',
        enableHeatmap: false,
        heatmapGridSize: 50
      });

      sampledAgg.record(Date.now(), 49000, 'BTC/USDT');
      await sampledAgg.flush();

      expect(sendFn).toHaveBeenCalledWith(
        expect.objectContaining({ sampling_rate: 1 })
      );
    });
  });

  describe('heatmap bucketing', () => {
    it('should track heatmap buckets when enabled', async () => {
      const heatmapAgg = new CrosshairAggregator(sendFn as any, {
        windowMs: 100,
        fullStreamPct: 1,
        userBucketVal: null,
        sessionId: 'test',
        clientVersion: '1.0.0',
        enableHeatmap: true,
        heatmapGridSize: 50
      });

      heatmapAgg.record(Date.now(), 49000, 'BTC/USDT', 100, 200);
      heatmapAgg.record(Date.now(), 49100, 'BTC/USDT', 120, 220);
      heatmapAgg.record(Date.now(), 49200, 'BTC/USDT', 100, 200); // Same bucket as first

      await heatmapAgg.flush();

      expect(sendFn).toHaveBeenCalledWith(
        expect.objectContaining({
          heatmap_buckets: expect.objectContaining({
            '2,4': expect.any(Number) // (100/50, 200/50) and (120/50, 220/50) both = (2,4)
          })
        })
      );
    });

    it('should not include heatmap_buckets when disabled', async () => {
      aggregator.record(Date.now(), 49000, 'BTC/USDT', 100, 200);
      await aggregator.flush();

      expect(sendFn).toHaveBeenCalledWith(
        expect.not.objectContaining({ heatmap_buckets: expect.anything() })
      );
    });
  });

  describe('retry logic', () => {
    it('should retry on failure with exponential backoff', async () => {
      sendFn
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined);

      aggregator.record(Date.now(), 49000, 'BTC/USDT');
      await aggregator.flush();

      // Should have retried 3 times
      expect(sendFn).toHaveBeenCalledTimes(3);

      const metrics = aggregator.getMetrics();
      expect(metrics.retries).toBe(2); // First call + 2 retries
      expect(metrics.flushed).toBe(1);
    });

    it('should drop event after max retries', async () => {
      sendFn.mockRejectedValue(new Error('Network error'));

      aggregator.record(Date.now(), 49000, 'BTC/USDT');
      await aggregator.flush();

      const metrics = aggregator.getMetrics();
      expect(metrics.dropped).toBe(1);
      expect(metrics.flushed).toBe(0);
    });
  });

  describe('forceFlush', () => {
    it('should flush immediately', async () => {
      aggregator.record(Date.now(), 49000, 'BTC/USDT');
      aggregator.forceFlush();

      // Should not need to wait for window
      expect(sendFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('shouldSendRawEvent', () => {
    it('should return true for full-stream users', () => {
      const fullStreamAgg = new CrosshairAggregator(sendFn as any, {
        windowMs: 100,
        fullStreamPct: 1,
        userBucketVal: 50, // < 100 (1%)
        sessionId: 'test',
        clientVersion: '1.0.0',
        enableHeatmap: false,
        heatmapGridSize: 50
      });

      expect(fullStreamAgg.shouldSendRawEvent()).toBe(true);
    });

    it('should return false for sampled users', () => {
      const sampledAgg = new CrosshairAggregator(sendFn as any, {
        windowMs: 100,
        fullStreamPct: 1,
        userBucketVal: 5000, // > 100 (1%)
        sessionId: 'test',
        clientVersion: '1.0.0',
        enableHeatmap: false,
        heatmapGridSize: 50
      });

      expect(sampledAgg.shouldSendRawEvent()).toBe(false);
    });
  });

  describe('updateWindow', () => {
    it('should update window size', () => {
      aggregator.updateWindow(5000);
      expect(aggregator['config'].windowMs).toBe(5000);
    });

    it('should reject invalid window sizes', () => {
      aggregator.updateWindow(500); // Too small
      expect(aggregator['config'].windowMs).toBe(100); // Unchanged

      aggregator.updateWindow(100000); // Too large
      expect(aggregator['config'].windowMs).toBe(100); // Unchanged
    });
  });
});

/**
 * React Hook for Chart Crosshair Tracking
 *
 * Integrates CrosshairAggregator with React component lifecycle
 * Automatically manages initialization, cleanup, and configuration
 *
 * Usage:
 * ```tsx
 * const { trackCrosshair, metrics } = useCrosshairTracking(symbol, userId);
 *
 * const handlePointerMove = (e: PointerEvent) => {
 *   const data = getChartDataAtPosition(e.clientX, e.clientY);
 *   trackCrosshair(data.time, data.price, e.clientX, e.clientY);
 * };
 * ```
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { CrosshairAggregator, AggregatorMetrics } from '@/lib/analytics/crosshair-aggregator';
import { userBucket } from '@/lib/analytics/hash';

export interface UseCrosshairTrackingConfig {
  /** Trading pair symbol */
  symbol: string;
  /** User identifier */
  userId: string;
  /** Override window size (default from env) */
  windowMs?: number;
  /** Override full-stream percentage (default from env) */
  fullStreamPct?: number;
  /** Enable heatmap tracking (default from env) */
  enableHeatmap?: boolean;
}

export function useCrosshairTracking(config: UseCrosshairTrackingConfig) {
  const { symbol, userId, windowMs, fullStreamPct, enableHeatmap } = config;

  const aggregatorRef = useRef<CrosshairAggregator | null>(null);
  const [metrics, setMetrics] = useState<AggregatorMetrics | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Read config from env
    const envWindowMs = Number(import.meta.env.VITE_CROSSHAIR_AGG_WINDOW_MS) || 5000;
    const envFullStreamPct = Number(import.meta.env.VITE_CROSSHAIR_FULLSTREAM_PCT) || 1;
    const envEnableHeatmap = import.meta.env.VITE_CROSSHAIR_HEATMAP === 'true';
    const clientVersion = import.meta.env.VITE_APP_VERSION || 'dev';

    // Send function
    const sendFn = async (payload: any) => {
      const response = await fetch('/api/analytics/agg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000) // 5s timeout
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      // Check for adaptive window override
      const overrideWindow = response.headers.get('X-AGG-WINDOW-OVERRIDE');
      if (overrideWindow && aggregatorRef.current) {
        const newWindow = parseInt(overrideWindow, 10);
        if (!isNaN(newWindow)) {
          console.log(`[Crosshair] Server requested window change: ${newWindow}ms`);
          aggregatorRef.current.updateWindow(newWindow);
        }
      }

      return response;
    };

    // Initialize aggregator
    aggregatorRef.current = new CrosshairAggregator(sendFn, {
      windowMs: windowMs ?? envWindowMs,
      fullStreamPct: fullStreamPct ?? envFullStreamPct,
      userBucketVal: userBucket(userId),
      sessionId: crypto.randomUUID(),
      clientVersion,
      enableHeatmap: enableHeatmap ?? envEnableHeatmap,
      heatmapGridSize: 50
    });

    setIsReady(true);

    // Optional: Periodic metrics update for monitoring
    const metricsInterval = setInterval(() => {
      if (aggregatorRef.current) {
        setMetrics(aggregatorRef.current.getMetrics());
      }
    }, 10000); // Update every 10s

    // Cleanup
    return () => {
      clearInterval(metricsInterval);
      aggregatorRef.current?.forceFlush();
      aggregatorRef.current = null;
      setIsReady(false);
    };
  }, [userId, symbol, windowMs, fullStreamPct, enableHeatmap]);

  /**
   * Track crosshair move event
   *
   * @param time - Unix timestamp (ms)
   * @param price - Price at crosshair
   * @param x - Optional canvas X coordinate
   * @param y - Optional canvas Y coordinate
   */
  const trackCrosshair = useCallback(
    (time: number, price: number, x?: number, y?: number) => {
      if (!aggregatorRef.current || !isReady) {
        return;
      }

      aggregatorRef.current.record(time, price, symbol, x, y);
    },
    [symbol, isReady]
  );

  /**
   * Force flush (for testing or manual control)
   */
  const forceFlush = useCallback(() => {
    aggregatorRef.current?.forceFlush();
  }, []);

  /**
   * Check if user is in full-stream sample
   */
  const isFullStream = useCallback(() => {
    return aggregatorRef.current?.shouldSendRawEvent() ?? false;
  }, []);

  return {
    trackCrosshair,
    forceFlush,
    isFullStream,
    metrics,
    isReady
  };
}

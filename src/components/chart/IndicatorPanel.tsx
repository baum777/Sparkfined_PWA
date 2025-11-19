/**
 * IndicatorPanel Component
 *
 * Displays technical indicators (RSI, MACD) in a separate pane below the main chart.
 * Uses TradingView Lightweight Charts for consistent styling.
 *
 * Features:
 * - RSI with overbought/oversold zones (70/30)
 * - Auto-sync with main chart (shared time axis)
 * - Touch-optimized
 * - Dark mode styling
 *
 * @example
 * ```tsx
 * <IndicatorPanel
 *   data={rsiData}
 *   type="RSI"
 *   height={150}
 * />
 * ```
 */

import { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  LineData,
  Time,
  UTCTimestamp,
  LineSeries,
} from 'lightweight-charts';

interface IndicatorPanelProps {
  /** Indicator data (time + value) */
  data: { time: number; value: number }[];

  /** Indicator type */
  type: 'RSI' | 'MACD' | 'EMA';

  /** Panel height */
  height?: number;

  /** Custom className */
  className?: string;
}

export default function IndicatorPanel({
  data,
  type,
  height = 150,
  className = '',
}: IndicatorPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    // Create indicator chart
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#0a0a0a' },
        textColor: '#9E9E9E',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1,
          style: 3,
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1,
          style: 3,
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      kineticScroll: {
        touch: true,
        mouse: false,
      },
    });

    // Configure based on indicator type
    let lineColor = '#06b6d4'; // cyan-500 default
    let priceScaleOptions = {};

    if (type === 'RSI') {
      lineColor = '#a855f7'; // purple-500
      priceScaleOptions = {
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      };

      // Add overbought/oversold zones
      const oversoldLine = chart.addSeries(LineSeries, {
        color: 'rgba(16, 185, 129, 0.3)', // emerald-500 transparent
        lineWidth: 1,
        lineStyle: 2, // Dashed
        priceLineVisible: false,
        lastValueVisible: false,
      });

      const overboughtLine = chart.addSeries(LineSeries, {
        color: 'rgba(244, 63, 94, 0.3)', // rose-500 transparent
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      // RSI zones: 30 (oversold), 70 (overbought)
      const zoneData = data.map((d) => ({
        time: d.time as UTCTimestamp,
        value: 30,
      }));
      oversoldLine.setData(zoneData);

      const obZoneData = data.map((d) => ({
        time: d.time as UTCTimestamp,
        value: 70,
      }));
      overboughtLine.setData(obZoneData);
    }

    // Add main indicator line
    const series = chart.addSeries(LineSeries, {
      color: lineColor,
      lineWidth: 2,
      ...priceScaleOptions,
    });

    const chartData: LineData<Time>[] = data.map((d) => ({
      time: d.time as UTCTimestamp,
      value: d.value,
    }));

    series.setData(chartData);
    seriesRef.current = series;

    // Fit content
    chart.timeScale().fitContent();

    chartRef.current = chart;

    // Resize handler
    const handleResize = () => {
      if (containerRef.current && chart) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [data, type]);

  return (
    <div className={`relative ${className}`}>
      {/* Indicator Label */}
      <div className="absolute top-2 left-3 z-10 bg-zinc-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-zinc-300">
        {type}
      </div>

      <div ref={containerRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
}

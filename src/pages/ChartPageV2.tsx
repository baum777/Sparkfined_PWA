/**
 * Chart Page V2 - Variant 1: Chart Dominance
 * 
 * Layout:
 * - Token search with autocomplete
 * - Timeframe selector (1m → 1w)
 * - Chart canvas (75vh height)
 * - Active indicators panel
 * - On-chain metrics + quick actions
 */

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import TokenSearchAutocomplete from '@/components/search/TokenSearchAutocomplete';
import { SimpleFilterChips } from '@/components/filters/FilterChips';
import LightweightChartCanvas from '@/components/chart/LightweightChartCanvas';
import IndicatorPanel from '@/components/chart/IndicatorPanel';
import { generateMockOHLC, calculateRSI, calculateEMA } from '@/lib/chartUtils';
import type { BiasLabel } from '@/types/ai';
import type { Token } from '@/types/token';
import { Star, Maximize2, Plus, Bell, FileText, Share2 } from 'lucide-react';

export default function ChartPageV2() {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['RSI']);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [crosshairData, setCrosshairData] = useState<{
    open?: number;
    high?: number;
    low?: number;
    close?: number;
  }>({});

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
  const filterOptions = ['Meme', 'DeFi', 'Layer-1', 'Top 100', 'Trending'];

  const indicators: { name: string; value: string; status: BiasLabel }[] = [
    { name: 'RSI', value: '65', status: 'neutral' },
    { name: 'MACD', value: 'Bullish', status: 'bullish' },
    { name: 'EMA(20)', value: '$148.50', status: 'bullish' },
  ];

  const metrics = [
    { label: '24h Volume', value: '$2.4B' },
    { label: 'Market Cap', value: '$68.5B' },
    { label: 'Holders', value: '1.2M' },
    { label: 'Social Score', value: '8.5/10' },
  ];

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    console.log('[ChartPageV2] Selected token:', token);
  };

  const handleFilterToggle = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
  };

  const handleIndicatorToggle = (indicator: string) => {
    setActiveIndicators((prev) =>
      prev.includes(indicator) ? prev.filter((i) => i !== indicator) : [...prev, indicator]
    );
  };

  // Generate chart data based on selected token
  const chartData = useMemo(() => {
    if (!selectedToken) return [];

    // Map timeframe to interval in seconds
    const intervalMap: Record<string, number> = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '1h': 3600,
      '4h': 14400,
      '1d': 86400,
      '1w': 604800,
    };

    const interval = intervalMap[selectedTimeframe] || 3600;
    return generateMockOHLC(selectedToken.symbol, 30, interval);
  }, [selectedToken, selectedTimeframe]);

  // Calculate RSI data
  const rsiData = useMemo(() => {
    if (chartData.length === 0) return [];
    return calculateRSI(chartData, 14);
  }, [chartData]);

  // Calculate EMA data
  const emaData = useMemo(() => {
    if (chartData.length === 0) return [];
    return calculateEMA(chartData, 20);
  }, [chartData]);

  const handleCrosshairMove = (price: number | null, time: number | null) => {
    if (price !== null && time !== null) {
      // Find the candle at this time
      const candle = chartData.find((d) => d.time === time);
      if (candle) {
        setCrosshairData({
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        });
      }
    } else {
      // Use latest candle
      const latest = chartData[chartData.length - 1];
      if (latest) {
        setCrosshairData({
          open: latest.open,
          high: latest.high,
          low: latest.low,
          close: latest.close,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-full px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Top Row: Search + Selected Token */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Token Search */}
              <div className="flex-1 max-w-md">
                <TokenSearchAutocomplete
                  onSelect={handleTokenSelect}
                  placeholder="Search tokens (e.g., SOL, BTC, ETH)"
                  defaultValue={selectedToken?.symbol || ''}
                />
              </div>

              {/* Selected Token Info */}
              {selectedToken && (
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold">{selectedToken.symbol}</h1>
                      <Badge variant="neutral">{selectedToken.name}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-mono font-bold">
                        ${selectedToken.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <Badge variant={selectedToken.change24h > 0 ? 'success' : 'error'}>
                        {selectedToken.change24h > 0 ? '+' : ''}
                        {selectedToken.change24h.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors touch-manipulation">
                    <Star className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Row: Filters */}
            <SimpleFilterChips
              chips={filterOptions}
              activeChips={activeFilters}
              onToggle={handleFilterToggle}
              onClearAll={handleClearFilters}
              layout="horizontal-scroll"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full px-4 md:px-6 lg:px-8 py-6">
        {/* Chart Toolbar */}
        <Card variant="default" className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Timeframe Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Timeframe:</span>
              <div className="flex gap-1">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`
                      px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                      ${
                        selectedTimeframe === tf
                          ? 'bg-blue-500 text-white'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                      }
                    `}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Controls */}
            <div className="flex items-center gap-2">
              <select className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 focus:ring-2 focus:ring-blue-500">
                <option>Candlestick</option>
                <option>Line</option>
                <option>Area</option>
              </select>
              <div className="relative group">
                <Button variant="ghost" size="sm" leftIcon={<Plus className="w-3 h-3" />}>
                  Indicators
                </Button>
                {/* Indicator Dropdown */}
                <div className="hidden group-hover:block absolute top-full right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl py-2 min-w-[150px] z-20">
                  {['RSI', 'EMA'].map((indicator) => (
                    <button
                      key={indicator}
                      onClick={() => handleIndicatorToggle(indicator)}
                      className={`w-full px-4 py-2 text-sm text-left hover:bg-zinc-800 transition-colors ${
                        activeIndicators.includes(indicator) ? 'text-blue-400' : 'text-zinc-300'
                      }`}
                    >
                      {activeIndicators.includes(indicator) ? '✓ ' : ''}
                      {indicator}
                    </button>
                  ))}
                </div>
              </div>
              <button className="p-2 hover:bg-zinc-800 rounded-md transition-colors">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Chart Canvas */}
        <div className="mb-6 space-y-3">
          <Card variant="default" className="overflow-hidden">
            <div className="relative">
              {/* Crosshair Info (Overlay) */}
              {selectedToken && crosshairData.close && (
                <div className="absolute top-4 left-4 z-10 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 rounded-lg p-3">
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-zinc-500">O</span>
                      <span className="ml-1 font-mono text-zinc-100">
                        {crosshairData.open?.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">H</span>
                      <span className="ml-1 font-mono text-green-500">
                        {crosshairData.high?.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">L</span>
                      <span className="ml-1 font-mono text-red-500">
                        {crosshairData.low?.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">C</span>
                      <span className="ml-1 font-mono text-zinc-100">
                        {crosshairData.close?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Chart */}
              {selectedToken && chartData.length > 0 ? (
                <LightweightChartCanvas
                  data={chartData}
                  symbol={selectedToken.symbol}
                  height={500}
                  onCrosshairMove={handleCrosshairMove}
                  showVolume={true}
                />
              ) : (
                <div
                  className="flex items-center justify-center bg-[#0a0a0a]"
                  style={{ height: '500px' }}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-zinc-400 text-lg font-medium mb-2">
                      Select a token to view chart
                    </p>
                    <p className="text-zinc-500 text-sm">
                      Use the search above to find SOL, BTC, ETH, or any other token
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Indicator Panels */}
          {selectedToken && activeIndicators.includes('RSI') && rsiData.length > 0 && (
            <Card variant="default" className="overflow-hidden">
              <IndicatorPanel data={rsiData} type="RSI" height={150} />
            </Card>
          )}

          {selectedToken && activeIndicators.includes('EMA') && emaData.length > 0 && (
            <Card variant="default" className="overflow-hidden">
              <IndicatorPanel data={emaData} type="EMA" height={150} />
            </Card>
          )}
        </div>

        {/* Bottom Section - Indicators + Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Technical Indicators */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Indicators</CardTitle>
                <Button variant="ghost" size="sm">Configure</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {indicators.map((indicator) => (
                  <div
                    key={indicator.name}
                    className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-100">
                        {indicator.name}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {indicator.status === 'bullish' && '↑ Bullish Signal'}
                        {indicator.status === 'bearish' && '↓ Bearish Signal'}
                        {indicator.status === 'neutral' && '→ Neutral'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono font-bold tabular-nums">
                        {indicator.value}
                      </p>
                      {indicator.status === 'bullish' && (
                        <Badge variant="success" className="mt-1">Bullish</Badge>
                      )}
                      {indicator.status === 'neutral' && (
                        <Badge variant="neutral" className="mt-1">Neutral</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* On-Chain Metrics + Quick Actions */}
          <div className="space-y-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>On-Chain Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {metrics.map((metric) => (
                    <div key={metric.label}>
                      <p className="text-xs text-zinc-500 mb-1">{metric.label}</p>
                      <p className="text-lg font-mono font-bold tabular-nums">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="primary" className="w-full" leftIcon={<Bell className="w-4 h-4" />}>
                    Create Alert
                  </Button>
                  <Button variant="secondary" className="w-full" leftIcon={<FileText className="w-4 h-4" />}>
                    Add to Journal
                  </Button>
                  <Button variant="ghost" className="w-full" leftIcon={<Share2 className="w-4 h-4" />}>
                    Share Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

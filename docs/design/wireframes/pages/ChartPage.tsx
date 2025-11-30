import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

// Mock Icons
const SearchIcon = () => <span>🔍</span>;
const StarIcon = () => <span>⭐</span>;
const FullscreenIcon = () => <span>⛶</span>;

const ChartPage: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState('SOL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [activeIndicators, setActiveIndicators] = useState(['RSI', 'MACD']);

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
  const indicators = [
    { name: 'RSI', value: '65', status: 'neutral' as const },
    { name: 'MACD', value: 'Bullish', status: 'bullish' as const },
    { name: 'EMA(20)', value: '$148.50', status: 'bullish' as const },
  ];

  const metrics = [
    { label: '24h Volume', value: '$2.4B' },
    { label: 'Market Cap', value: '$68.5B' },
    { label: 'Holders', value: '1.2M' },
    { label: 'Social Score', value: '8.5/10' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-full px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Token Search */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search tokens (e.g. SOL, BTC)"
                leftIcon={<SearchIcon />}
                defaultValue={selectedToken}
              />
            </div>

            {/* Selected Token Info */}
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{selectedToken}</h1>
                  <Badge variant="neutral">Solana</Badge>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-mono font-bold">$152.34</span>
                  <Badge variant="success">+12.5%</Badge>
                </div>
              </div>
              <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                <StarIcon />
              </button>
            </div>
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
              <span className="text-sm text-neutral-400">Timeframe:</span>
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
                          : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
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
              <select className="px-3 py-1.5 bg-zinc-800 border border-neutral-700 rounded-md text-sm text-neutral-100 focus:ring-2 focus:ring-blue-500">
                <option>Candlestick</option>
                <option>Line</option>
                <option>Area</option>
              </select>
              <Button variant="ghost" size="sm" leftIcon={<span>+</span>}>
                Add Indicator
              </Button>
              <button className="p-2 hover:bg-neutral-800 rounded-md transition-colors">
                <FullscreenIcon />
              </button>
            </div>
          </div>
        </Card>

        {/* Chart Canvas */}
        <Card variant="default" className="mb-6">
          <div className="relative bg-[#0a0a0a] rounded-lg" style={{ height: '500px' }}>
            {/* Placeholder for chart library (Lightweight Charts / TradingView) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-neutral-400 text-lg font-medium mb-2">
                  Chart Canvas Placeholder
                </p>
                <p className="text-neutral-500 text-sm">
                  Integrate Lightweight Charts or TradingView library here
                </p>
              </div>
            </div>

            {/* Crosshair Info (Overlay) */}
            <div className="absolute top-4 left-4 bg-zinc-900/90 backdrop-blur-md border border-neutral-700 rounded-lg p-3">
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-neutral-500">O</span>
                  <span className="ml-1 font-mono text-neutral-100">150.20</span>
                </div>
                <div>
                  <span className="text-neutral-500">H</span>
                  <span className="ml-1 font-mono text-green-500">153.45</span>
                </div>
                <div>
                  <span className="text-neutral-500">L</span>
                  <span className="ml-1 font-mono text-red-500">149.80</span>
                </div>
                <div>
                  <span className="text-neutral-500">C</span>
                  <span className="ml-1 font-mono text-neutral-100">152.34</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

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
                    className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-100">
                        {indicator.name}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
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
                      <p className="text-xs text-neutral-500 mb-1">{metric.label}</p>
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
                  <Button variant="primary" className="w-full">
                    Create Alert
                  </Button>
                  <Button variant="secondary" className="w-full">
                    Add to Journal
                  </Button>
                  <Button variant="ghost" className="w-full">
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
};

export default ChartPage;

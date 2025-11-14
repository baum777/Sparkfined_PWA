import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

// Mock Icons (replace with react-icons or lucide-react)
const TrendUpIcon = () => <span>↑</span>;
const TrendDownIcon = () => <span>↓</span>;
const PlusIcon = () => <span>+</span>;
const AlertIcon = () => <span>🔔</span>;
const JournalIcon = () => <span>📝</span>;
const ChartIcon = () => <span>📊</span>;

interface KPIData {
  label: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

interface ActivityItem {
  id: string;
  type: 'journal' | 'alert';
  timestamp: Date;
  title: string;
  excerpt?: string;
}

interface MarketMover {
  symbol: string;
  name: string;
  change24h: number;
  price: string;
}

const DashboardPage: React.FC = () => {
  // Mock data
  const kpiData: KPIData[] = [
    {
      label: 'Total P&L',
      value: '$1,234.56',
      change: 12.5,
      trend: 'up',
      icon: <span className="text-2xl">💰</span>,
    },
    {
      label: 'Win Rate',
      value: '68%',
      change: 5.2,
      trend: 'up',
      icon: <span className="text-2xl">🎯</span>,
    },
    {
      label: 'Active Alerts',
      value: '12',
      icon: <span className="text-2xl">🔔</span>,
    },
    {
      label: 'Journal Entries',
      value: '47',
      change: 8,
      trend: 'up',
      icon: <span className="text-2xl">📝</span>,
    },
  ];

  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'journal',
      timestamp: new Date(Date.now() - 3600000),
      title: 'SOL trade - took profit early',
      excerpt: 'Exited at $152, should have waited for $155 resistance...',
    },
    {
      id: '2',
      type: 'alert',
      timestamp: new Date(Date.now() - 7200000),
      title: 'Alert triggered: BTC > $45,000',
      excerpt: 'Current price: $45,234',
    },
    {
      id: '3',
      type: 'journal',
      timestamp: new Date(Date.now() - 14400000),
      title: 'FOMO trade on BONK',
      excerpt: 'Entered late, down 5%. Need to be more disciplined...',
    },
  ];

  const marketMovers: MarketMover[] = [
    { symbol: 'SOL', name: 'Solana', change24h: 15.3, price: '$152.34' },
    { symbol: 'BONK', name: 'Bonk', change24h: -8.7, price: '$0.00002' },
    { symbol: 'JUP', name: 'Jupiter', change24h: 22.1, price: '$1.23' },
  ];

  const formatRelativeTime = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-full px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-neutral-400 mt-1">Welcome back, trader</p>
            </div>
            <div className="flex items-center gap-4">
              <select className="px-3 py-2 bg-zinc-800 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:ring-2 focus:ring-blue-500">
                <option>Today</option>
                <option>7 Days</option>
                <option>30 Days</option>
                <option>All Time</option>
              </select>
              <Badge variant="success">● Online</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full px-4 md:px-6 lg:px-8 py-8">
        {/* KPI Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {kpiData.map((kpi, index) => (
            <Card key={index} variant="default">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-neutral-400 mb-1">{kpi.label}</p>
                  <p className="text-2xl font-mono font-bold tabular-nums">
                    {kpi.value}
                  </p>
                  {kpi.change !== undefined && (
                    <div className="flex items-center gap-1 mt-2">
                      {kpi.trend === 'up' ? (
                        <span className="text-green-500"><TrendUpIcon /></span>
                      ) : (
                        <span className="text-red-500"><TrendDownIcon /></span>
                      )}
                      <span
                        className={`text-xs font-medium ${
                          kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {kpi.change > 0 ? '+' : ''}{kpi.change}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-3xl">{kpi.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Middle Row - Activity Feed + Market Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Feed - 2/3 width */}
          <div className="lg:col-span-2">
            <Card variant="default">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <div className="text-xl mt-1">
                        {activity.type === 'journal' ? <JournalIcon /> : <AlertIcon />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-neutral-100">
                            {activity.title}
                          </p>
                          <span className="text-xs text-neutral-500 whitespace-nowrap">
                            {formatRelativeTime(activity.timestamp)}
                          </span>
                        </div>
                        {activity.excerpt && (
                          <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                            {activity.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Movers - 1/3 width */}
          <div className="lg:col-span-1">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Market Movers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketMovers.map((token) => (
                    <div
                      key={token.symbol}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-100">
                          {token.symbol}
                        </p>
                        <p className="text-xs text-neutral-500">{token.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono tabular-nums">
                          {token.price}
                        </p>
                        <p
                          className={`text-xs font-medium ${
                            token.change24h > 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {token.change24h > 0 ? '+' : ''}
                          {token.change24h.toFixed(1)}%
                        </p>
                      </div>
                      <button className="ml-2 p-1 hover:bg-neutral-700 rounded">
                        <PlusIcon />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <Card variant="glass">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" leftIcon={<JournalIcon />}>
              New Journal Entry
            </Button>
            <Button variant="secondary" leftIcon={<AlertIcon />}>
              Create Alert
            </Button>
            <Button variant="secondary" leftIcon={<ChartIcon />}>
              Open Chart
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default DashboardPage;

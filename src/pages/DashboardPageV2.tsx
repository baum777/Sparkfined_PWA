/**
 * Dashboard Page V2 - Variant 1: KPI Focus
 * 
 * Layout:
 * - 4 KPI Tiles (P&L, Win Rate, Active Alerts, Journal Entries)
 * - Activity Feed (60%) | Market Movers (40%)
 * - Quick Actions Bar
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { TrendingUp, TrendingDown, Plus, Bell, FileText, BarChart3 } from 'lucide-react';
import useBoardKPIs from '@/hooks/useBoardKPIs';
import useBoardFeed from '@/hooks/useBoardFeed';

interface KPIData {
  label: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
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

export default function DashboardPageV2() {
  const { summary: kpis } = useBoardKPIs();
  const { data: feedItems } = useBoardFeed();

  // Transform real data to KPI format
  const kpiData: KPIData[] = [
    {
      label: 'Total P&L',
      value: kpis?.totalPnL ? `$${kpis.totalPnL.toFixed(2)}` : '$0.00',
      change: kpis?.pnlChange || 0,
      trend: (kpis?.pnlChange || 0) > 0 ? 'up' : 'down',
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      label: 'Win Rate',
      value: kpis?.winRate ? `${kpis.winRate}%` : '0%',
      change: kpis?.winRateChange || 0,
      trend: (kpis?.winRateChange || 0) > 0 ? 'up' : 'down',
      icon: <BarChart3 className="w-6 h-6" />,
    },
    {
      label: 'Active Alerts',
      value: String(kpis?.activeAlerts || 0),
      icon: <Bell className="w-6 h-6" />,
    },
    {
      label: 'Journal Entries',
      value: String(kpis?.journalCount || 0),
      change: kpis?.journalChange || 0,
      trend: (kpis?.journalChange || 0) > 0 ? 'up' : 'down',
      icon: <FileText className="w-6 h-6" />,
    },
  ];

  const activities: ActivityItem[] = (feedItems ?? []).slice(0, 5).map((item) => ({
    id: item.id,
    type: item.type === 'alert' ? 'alert' : 'journal',
    timestamp: new Date(item.timestamp ?? Date.now()),
    title: item.text || 'New event',
    excerpt: item.metadata?.symbol ? `${item.metadata.symbol} · ${item.metadata.timeframe ?? ''}`.trim() : item.metadata?.timeframe || item.text,
  }));

  // Mock market movers (replace with real data later)
  const marketMovers: MarketMover[] = [
    { symbol: 'SOL', name: 'Solana', change24h: 15.3, price: '$152.34' },
    { symbol: 'BONK', name: 'Bonk', change24h: -8.7, price: '$0.00002' },
    { symbol: 'JUP', name: 'Jupiter', change24h: 22.1, price: '$1.23' },
  ];

  const formatRelativeTime = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-full px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-zinc-400 mt-1">Welcome back, trader</p>
            </div>
            <div className="flex items-center gap-4">
              <select className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:ring-2 focus:ring-blue-500">
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
                  <p className="text-sm text-zinc-400 mb-1">{kpi.label}</p>
                  <p className="text-2xl font-mono font-bold tabular-nums">
                    {kpi.value}
                  </p>
                  {kpi.change !== undefined && (
                    <div className="flex items-center gap-1 mt-2">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-zinc-400">{kpi.icon}</div>
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
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <div className="text-xl mt-1">
                          {activity.type === 'journal' ? <FileText className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-zinc-100">
                              {activity.title}
                            </p>
                            <span className="text-xs text-zinc-500 whitespace-nowrap">
                              {formatRelativeTime(activity.timestamp)}
                            </span>
                          </div>
                          {activity.excerpt && (
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                              {activity.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-zinc-500">
                      <p>No recent activity</p>
                    </div>
                  )}
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
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-100">
                          {token.symbol}
                        </p>
                        <p className="text-xs text-zinc-500">{token.name}</p>
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
                      <button className="ml-2 p-1 hover:bg-zinc-700 rounded">
                        <Plus className="w-4 h-4" />
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
            <Button variant="primary" leftIcon={<FileText className="w-4 h-4" />}>
              New Journal Entry
            </Button>
            <Button variant="secondary" leftIcon={<Bell className="w-4 h-4" />}>
              Create Alert
            </Button>
            <Button variant="secondary" leftIcon={<BarChart3 className="w-4 h-4" />}>
              Open Chart
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}

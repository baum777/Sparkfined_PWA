import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

// Mock Icons
const BellIcon = () => <span>🔔</span>;
const TrendingIcon = () => <span>📈</span>;
const ToggleOnIcon = () => <span>🟢</span>;
const ToggleOffIcon = () => <span>⚪</span>;
const DeleteIcon = () => <span>🗑️</span>;
const PlusIcon = () => <span>+</span>;

type AlertStatus = 'active' | 'triggered' | 'disabled';

interface PriceAlert {
  id: string;
  token: string;
  condition: string;
  threshold: string;
  status: AlertStatus;
  createdAt: Date;
  triggeredAt?: Date;
}

interface SignalRule {
  id: string;
  name: string;
  token: string;
  conditionsSummary: string;
  status: AlertStatus;
  lastTriggered?: Date;
}

const AlertsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'price' | 'signals'>('price');

  // Mock data
  const priceAlerts: PriceAlert[] = [
    {
      id: '1',
      token: 'SOL',
      condition: 'Price Above',
      threshold: '$150',
      status: 'active',
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: '2',
      token: 'BTC',
      condition: 'Price Below',
      threshold: '$44,000',
      status: 'triggered',
      createdAt: new Date(Date.now() - 172800000),
      triggeredAt: new Date(Date.now() - 3600000),
    },
    {
      id: '3',
      token: 'BONK',
      condition: 'Change % (24h)',
      threshold: '+10%',
      status: 'disabled',
      createdAt: new Date(Date.now() - 259200000),
    },
  ];

  const signalRules: SignalRule[] = [
    {
      id: '1',
      name: 'Oversold + Volume Spike',
      token: 'SOL',
      conditionsSummary: 'RSI < 30 AND Volume > 2M',
      status: 'active',
      lastTriggered: new Date(Date.now() - 86400000),
    },
    {
      id: '2',
      name: 'Golden Cross',
      token: 'BTC',
      conditionsSummary: 'EMA(50) crosses above EMA(200)',
      status: 'active',
    },
  ];

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'triggered':
        return <Badge variant="info">Triggered</Badge>;
      case 'disabled':
        return <Badge variant="neutral">Disabled</Badge>;
    }
  };

  const formatDate = (date?: Date): string => {
    if (!date) return 'Never';
    const now = Date.now();
    const diff = now - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-full px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Alerts & Signals</h1>
              <p className="text-sm text-neutral-400 mt-1">
                {priceAlerts.filter((a) => a.status === 'active').length + 
                 signalRules.filter((r) => r.status === 'active').length} active alerts
              </p>
            </div>
            <Button variant="primary" leftIcon={<PlusIcon />}>
              New Alert
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-neutral-800 mt-4 -mb-px">
            <button
              onClick={() => setActiveTab('price')}
              className={`
                px-4 py-2 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === 'price'
                    ? 'text-blue-500 border-blue-500'
                    : 'text-neutral-400 border-transparent hover:text-neutral-200 hover:border-neutral-700'
                }
              `}
            >
              Price Alerts ({priceAlerts.length})
            </button>
            <button
              onClick={() => setActiveTab('signals')}
              className={`
                px-4 py-2 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === 'signals'
                    ? 'text-blue-500 border-blue-500'
                    : 'text-neutral-400 border-transparent hover:text-neutral-200 hover:border-neutral-700'
                }
              `}
            >
              Signal Rules ({signalRules.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Price Alerts Tab */}
        {activeTab === 'price' && (
          <div className="space-y-4">
            {/* Grouped by Status */}
            <div>
              <h2 className="text-sm font-medium text-neutral-400 mb-3">Active</h2>
              {priceAlerts
                .filter((alert) => alert.status === 'active')
                .map((alert) => (
                  <Card key={alert.id} variant="default" className="mb-3">
                    <div className="flex items-center justify-between">
                      {/* Alert Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl">
                          <BellIcon />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-lg font-semibold">{alert.token}</p>
                            {getStatusBadge(alert.status)}
                          </div>
                          <p className="text-sm text-neutral-400">
                            {alert.condition} {alert.threshold}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            Created {formatDate(alert.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-neutral-800 rounded-md transition-colors">
                          <ToggleOnIcon />
                        </button>
                        <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-md transition-colors">
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>

            <div>
              <h2 className="text-sm font-medium text-neutral-400 mb-3">Triggered</h2>
              {priceAlerts
                .filter((alert) => alert.status === 'triggered')
                .map((alert) => (
                  <Card key={alert.id} variant="default" className="mb-3 border-cyan-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl">
                          <BellIcon />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-lg font-semibold">{alert.token}</p>
                            {getStatusBadge(alert.status)}
                          </div>
                          <p className="text-sm text-neutral-400">
                            {alert.condition} {alert.threshold}
                          </p>
                          <p className="text-xs text-cyan-500 mt-1">
                            Triggered {formatDate(alert.triggeredAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm">
                          View Chart
                        </Button>
                        <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-md transition-colors">
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>

            <div>
              <h2 className="text-sm font-medium text-neutral-400 mb-3">Disabled</h2>
              {priceAlerts
                .filter((alert) => alert.status === 'disabled')
                .map((alert) => (
                  <Card key={alert.id} variant="default" className="mb-3 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl">
                          <BellIcon />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-lg font-semibold">{alert.token}</p>
                            {getStatusBadge(alert.status)}
                          </div>
                          <p className="text-sm text-neutral-400">
                            {alert.condition} {alert.threshold}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-neutral-800 rounded-md transition-colors">
                          <ToggleOffIcon />
                        </button>
                        <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-md transition-colors">
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Signal Rules Tab */}
        {activeTab === 'signals' && (
          <div className="space-y-4">
            {signalRules.map((rule) => (
              <Card key={rule.id} variant="default">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl">
                      <TrendingIcon />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-lg font-semibold">{rule.name}</p>
                        {getStatusBadge(rule.status)}
                      </div>
                      <p className="text-sm text-neutral-400 mb-1">
                        {rule.token} • {rule.conditionsSummary}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Last triggered: {formatDate(rule.lastTriggered)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm">
                      Edit Rule
                    </Button>
                    <button className="p-2 hover:bg-neutral-800 rounded-md transition-colors">
                      <ToggleOnIcon />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-md transition-colors">
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AlertsPage;

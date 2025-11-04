/**
 * Focus Zone — "Now Stream"
 * 
 * Displays recent activities:
 * - Last 3 analyses
 * - Last chart session
 * - Last journal entry
 */

import { Search, BarChart3, FileText } from '@/lib/icons';

interface ActivityCard {
  id: string;
  type: 'chart' | 'analysis' | 'journal';
  title: string;
  subtitle: string;
  timestamp: string;
}

export default function Focus() {
  // Mock data (will be replaced with IndexedDB query)
  const activities: ActivityCard[] = [
    { id: '1', type: 'analysis', title: 'SOL Analysis', subtitle: '15m • 12 KPIs', timestamp: '5m ago' },
    { id: '2', type: 'chart', title: 'BTC Chart Session', subtitle: '1h • 3 Shapes', timestamp: '23m ago' },
    { id: '3', type: 'journal', title: 'Trade Entry #42', subtitle: 'ETHUSD Scalp', timestamp: '1h ago' },
  ];
  
  // Icon mapping
  const iconMap = {
    analysis: Search,
    chart: BarChart3,
    journal: FileText,
  };
  
  const getIcon = (type: 'chart' | 'analysis' | 'journal') => {
    return iconMap[type];
  };
  
  return (
    <div>
      <h2 className="mb-3 text-base font-semibold text-zinc-100">Now Stream</h2>
      
      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = getIcon(activity.type);
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 border-b border-zinc-800 bg-zinc-900/40 p-4 transition-all hover:bg-zinc-900"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <Icon size={24} className="text-zinc-400" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-zinc-100">{activity.title}</h3>
                  <p className="text-xs text-zinc-500">{activity.subtitle}</p>
                </div>
                <span className="text-xs text-zinc-600">{activity.timestamp}</span>
              </div>
            );
          })}
        </div>
      ) : (
        // Empty State
        <div className="py-12 text-center">
          <Search size={32} className="mx-auto mb-3 text-zinc-600" />
          <p className="text-sm text-zinc-500">Keine Aktivität in den letzten 24h</p>
          <button className="mt-4 text-sm text-emerald-500 transition-colors hover:text-emerald-400">
            Erste Analyse starten
          </button>
        </div>
      )}
    </div>
  );
}

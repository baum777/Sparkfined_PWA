/**
 * Overview Zone — KPI Tiles
 * 
 * Displays 4-7 KPI tiles:
 * - Mobile: 2 visible by default, "Show more" for rest
 * - Desktop: All visible in horizontal grid
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from '@/lib/icons';

export default function Overview() {
  const [showAll, setShowAll] = useState(false);
  
  // Mock KPI data (will be replaced with real data from hooks)
  const kpis = {
    visible: [
      { id: 'pnl', label: 'Heute P&L', value: '+€247.50', trend: '+12.5%', color: 'emerald' },
      { id: 'alerts', label: 'Active Alerts', value: '3', trend: undefined, color: 'zinc' },
      { id: 'sentiment', label: 'Sentiment', value: '72/100', trend: '↑ +8 vs. 7d', color: 'emerald' },
      { id: 'sync', label: 'Sync Status', value: 'Online', trend: '2m ago', color: 'emerald' },
    ],
    collapsed: [
      { id: 'risk', label: 'Risk Score', value: '78/100', trend: undefined, color: 'emerald' },
      { id: 'charts', label: 'Active Charts', value: '2', trend: undefined, color: 'zinc' },
      { id: 'journal', label: 'Journal (heute)', value: '3', trend: undefined, color: 'zinc' },
    ],
  };
  
  const colorMap = {
    emerald: 'text-emerald-500',
    rose: 'text-rose-500',
    zinc: 'text-zinc-100',
  };
  
  return (
    <div>
      {/* Visible KPIs (Mobile: 4, Desktop: All) */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {kpis.visible.map((kpi) => (
          <div
            key={kpi.id}
            className="border-b border-zinc-800 bg-zinc-900 p-3 md:rounded-lg md:border"
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            <p className="text-xs font-medium text-zinc-500">{kpi.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <p className={`text-2xl font-semibold ${colorMap[kpi.color as keyof typeof colorMap]}`}>
                {kpi.value}
              </p>
              {kpi.trend && (
                <span className="text-xs text-zinc-500">{kpi.trend}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Collapsed KPIs (Mobile only) */}
      {showAll && (
        <div className="mt-3 grid grid-cols-2 gap-3 md:hidden">
          {kpis.collapsed.map((kpi) => (
            <div
              key={kpi.id}
              className="border-b border-zinc-800 bg-zinc-900 p-3"
            >
              <p className="text-xs font-medium text-zinc-500">{kpi.label}</p>
              <div className="mt-2">
                <p className={`text-2xl font-semibold ${colorMap[kpi.color as keyof typeof colorMap]}`}>
                  {kpi.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Show More Button (Mobile only) */}
      <button
        onClick={() => setShowAll(!showAll)}
        className="mt-3 flex w-full items-center justify-center gap-2 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-300 md:hidden"
      >
        {showAll ? (
          <>
            Show less <ChevronUp size={16} />
          </>
        ) : (
          <>
            Show 3 more <ChevronDown size={16} />
          </>
        )}
      </button>
    </div>
  );
}

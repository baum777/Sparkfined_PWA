/**
 * Overview Zone — KPI Tiles
 * 
 * Displays 4-7 KPI tiles:
 * - Mobile: 4 visible by default, "Show more" for rest
 * - Desktop: All visible in horizontal grid
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from '@/lib/icons';
import KPITile from './KPITile';

export default function Overview() {
  const [showAll, setShowAll] = useState(false);
  
  // Mock KPI data (will be replaced with real data from hooks)
  const kpis = {
    visible: [
      { 
        id: 'pnl', 
        type: 'numeric' as const,
        label: 'Heute P&L', 
        value: '+€247.50', 
        trend: '+12.5%', 
        direction: 'up' as const,
        icon: 'trending' as const,
      },
      { 
        id: 'alerts', 
        type: 'count' as const,
        label: 'Active Alerts', 
        value: '3', 
        trend: undefined, 
        direction: 'neutral' as const,
        icon: 'bell' as const,
      },
      { 
        id: 'sentiment', 
        type: 'numeric' as const,
        label: 'Sentiment', 
        value: '72/100', 
        trend: '↑ +8 vs. 7d', 
        direction: 'up' as const,
      },
      { 
        id: 'sync', 
        type: 'status' as const,
        label: 'Sync Status', 
        value: 'Online', 
        trend: '2m ago', 
        direction: 'up' as const,
        icon: 'wifi' as const,
      },
    ],
    collapsed: [
      { 
        id: 'risk', 
        type: 'numeric' as const,
        label: 'Risk Score', 
        value: '78/100', 
        trend: undefined, 
        direction: 'up' as const,
      },
      { 
        id: 'charts', 
        type: 'count' as const,
        label: 'Active Charts', 
        value: '2', 
        trend: undefined, 
        direction: 'neutral' as const,
      },
      { 
        id: 'journal', 
        type: 'count' as const,
        label: 'Journal (heute)', 
        value: '3', 
        trend: undefined, 
        direction: 'neutral' as const,
      },
    ],
  };
  
  return (
    <div>
      {/* Visible KPIs (Mobile: 4, Desktop: All) */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {kpis.visible.map((kpi) => (
          <KPITile
            key={kpi.id}
            type={kpi.type}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            direction={kpi.direction}
            icon={kpi.icon}
          />
        ))}
      </div>
      
      {/* Collapsed KPIs (Mobile only) */}
      {showAll && (
        <div className="mt-3 grid grid-cols-2 gap-3 md:hidden">
          {kpis.collapsed.map((kpi) => (
            <KPITile
              key={kpi.id}
              type={kpi.type}
              label={kpi.label}
              value={kpi.value}
              trend={kpi.trend}
              direction={kpi.direction}
            />
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

/**
 * Board KPIs Endpoint
 * 
 * Returns aggregated KPI data for Board Overview:
 * 1. Today P&L (numeric, calculated from today's journal entries)
 * 2. Active Alerts (count, from rules table)
 * 3. Active Charts (count, recent chart sessions)
 * 4. Sentiment (numeric, from Moralis Cortex - future)
 * 5. Risk Score (numeric, from Moralis Cortex - future)
 * 6. Journal Entries (count, total)
 * 7. Sync Status (status, online/offline + timestamp)
 * 8. Last Analysis (timestamp, most recent analysis)
 * 
 * Data Sources:
 * - IndexedDB (journal, rules, charts) - via client
 * - Moralis Cortex (sentiment, risk) - future
 * 
 * Edge Function: Fast response, minimal compute
 */

export const config = {
  runtime: 'edge',
};

interface KPI {
  id: string;
  label: string;
  value: string | number;
  type: 'numeric' | 'count' | 'status' | 'timestamp';
  direction?: 'up' | 'down' | 'neutral';
  trend?: string;
  icon?: 'alert' | 'chart' | 'journal' | 'sync' | 'time';
  timestamp?: number;
}

export default async function handler(req: Request) {
  try {
    // TODO: In Phase D4, replace with real data from:
    // - IndexedDB queries (journal, rules, charts)
    // - Moralis Cortex API (sentiment, risk)
    
    // Mock KPI data (for Phase D1)
    const kpis: KPI[] = [
      {
        id: 'pnl-today',
        label: "Today's P&L",
        value: '+$247',
        type: 'numeric',
        direction: 'up',
        trend: '+12%',
      },
      {
        id: 'active-alerts',
        label: 'Active Alerts',
        value: 3,
        type: 'count',
        direction: 'neutral',
        icon: 'alert',
      },
      {
        id: 'active-charts',
        label: 'Active Charts',
        value: 2,
        type: 'count',
        direction: 'neutral',
        icon: 'chart',
      },
      {
        id: 'sentiment',
        label: 'Sentiment',
        value: 67,
        type: 'numeric',
        direction: 'up',
        trend: '+5 pts',
      },
      {
        id: 'risk-score',
        label: 'Risk Score',
        value: 42,
        type: 'numeric',
        direction: 'down',
        trend: '-3 pts',
      },
      {
        id: 'journal-entries',
        label: 'Journal Entries',
        value: 156,
        type: 'count',
        direction: 'neutral',
        icon: 'journal',
      },
      {
        id: 'sync-status',
        label: 'Sync Status',
        value: 'Online',
        type: 'status',
        direction: 'up',
        icon: 'sync',
        timestamp: Date.now() - 120000, // 2 minutes ago
      },
    ];
    
    return new Response(
      JSON.stringify({
        ok: true,
        data: kpis,
        timestamp: Date.now(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error: any) {
    console.error('[board/kpis] Error:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message || 'Failed to fetch KPIs',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Usage:
 * GET /api/board/kpis
 * 
 * Response:
 * {
 *   ok: true,
 *   data: KPI[],
 *   timestamp: number
 * }
 */

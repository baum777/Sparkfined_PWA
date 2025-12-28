/**
 * Board Feed Endpoint
 * 
 * Returns recent activity feed items for Board Feed Zone:
 * - Alerts triggered
 * - Analyses saved
 * - Journal entries created
 * - Exports completed
 * - Errors
 * 
 * Data Sources:
 * - IndexedDB (journal, rules, charts, exports) - via client
 * - Server-side event log (errors, system events) - future
 * 
 * Query Params:
 * - limit: number (default: 20, max: 100)
 * - offset: number (default: 0)
 * - type: 'all' | 'alerts' | 'journal' | 'analysis' | 'export' | 'error' (default: 'all')
 * 
 * Node Function: Aggregates KV-backed feed items
 */

export const runtime = 'nodejs';

interface FeedEvent {
  id: string;
  type: 'alert' | 'analysis' | 'journal' | 'export' | 'error';
  text: string;
  timestamp: number;
  unread: boolean;
  metadata?: {
    symbol?: string;
    timeframe?: string;
    pnl?: number;
    alertId?: string;
  };
}

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '20', 10),
      100
    );
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const type = url.searchParams.get('type') || 'all';
    
    // TODO: In Phase D4, replace with real data from:
    // - IndexedDB queries (journal, rules, charts, exports)
    // - Server-side event log
    
    // Mock feed data (for Phase D1)
    const allEvents: FeedEvent[] = [
      {
        id: 'evt-1',
        type: 'alert',
        text: 'BTC > $50k erreicht',
        timestamp: Date.now() - 120000, // 2 minutes ago
        unread: true,
        metadata: { symbol: 'BTC', alertId: 'alert-123' },
      },
      {
        id: 'evt-2',
        type: 'analysis',
        text: 'SOL 15m → Journal gespeichert',
        timestamp: Date.now() - 300000, // 5 minutes ago
        unread: false,
        metadata: { symbol: 'SOL', timeframe: '15m' },
      },
      {
        id: 'evt-3',
        type: 'journal',
        text: 'Trade geschlossen: +$45 (+3.2%)',
        timestamp: Date.now() - 450000, // 7.5 minutes ago
        unread: false,
        metadata: { pnl: 45 },
      },
      {
        id: 'evt-4',
        type: 'export',
        text: 'CSV exported (247 rows)',
        timestamp: Date.now() - 600000, // 10 minutes ago
        unread: false,
      },
      {
        id: 'evt-5',
        type: 'alert',
        text: 'ETH < $3k erreicht',
        timestamp: Date.now() - 900000, // 15 minutes ago
        unread: false,
        metadata: { symbol: 'ETH', alertId: 'alert-124' },
      },
      {
        id: 'evt-6',
        type: 'analysis',
        text: 'BTC 1h → Analyse gestartet',
        timestamp: Date.now() - 1200000, // 20 minutes ago
        unread: false,
        metadata: { symbol: 'BTC', timeframe: '1h' },
      },
      {
        id: 'evt-7',
        type: 'error',
        text: 'API rate limit erreicht (Moralis)',
        timestamp: Date.now() - 1800000, // 30 minutes ago
        unread: false,
      },
    ];
    
    // Filter by type
    const filteredEvents =
      type === 'all'
        ? allEvents
        : allEvents.filter((e) => {
            if (type === 'alerts') return e.type === 'alert';
            if (type === 'journal') return e.type === 'journal' || e.type === 'analysis';
            return e.type === type;
          });
    
    // Paginate
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);
    
    return new Response(
      JSON.stringify({
        ok: true,
        data: paginatedEvents,
        total: filteredEvents.length,
        limit,
        offset,
        timestamp: Date.now(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        },
      }
    );
  } catch (error: any) {
    console.error('[board/feed] Error:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message || 'Failed to fetch feed',
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
 * GET /api/board/feed?limit=20&offset=0&type=all
 * 
 * Response:
 * {
 *   ok: true,
 *   data: FeedEvent[],
 *   total: number,
 *   limit: number,
 *   offset: number,
 *   timestamp: number
 * }
 */

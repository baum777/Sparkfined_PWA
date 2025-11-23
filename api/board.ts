// api/board.ts
// Consolidated Board API
// Consolidates: api/board/{kpis, feed} (2→1)
// Routes:
//   GET /api/board?action=kpis  → Dashboard KPI data
//   GET /api/board?action=feed  → Activity feed with pagination

export const runtime = "nodejs";

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    switch (action) {
      case "kpis":
        return handleKpis(req);
      case "feed":
        return handleFeed(req);
      default:
        return json(
          { error: "Unknown action. Use ?action=kpis|feed" },
          400
        );
    }
  } catch (error: any) {
    console.error("[board] Handler error:", error);
    return json({ error: error.message || "Internal error" }, 500);
  }
}

// ============================================================================
// KPIS
// ============================================================================

interface KPI {
  id: string;
  label: string;
  value: string | number;
  type: "numeric" | "count" | "status" | "timestamp";
  direction?: "up" | "down" | "neutral";
  trend?: string;
  icon?: "alert" | "chart" | "journal" | "sync" | "time";
  timestamp?: number;
}

async function handleKpis(_req: Request): Promise<Response> {
  try {
    // TODO: In Phase D4, replace with real data from:
    // - IndexedDB queries (journal, rules, charts)
    // - Moralis Cortex API (sentiment, risk)

    // Mock KPI data (for Phase D1)
    const kpis: KPI[] = [
      {
        id: "pnl-today",
        label: "Today's P&L",
        value: "+$247",
        type: "numeric",
        direction: "up",
        trend: "+12%",
      },
      {
        id: "active-alerts",
        label: "Active Alerts",
        value: 3,
        type: "count",
        direction: "neutral",
        icon: "alert",
      },
      {
        id: "active-charts",
        label: "Active Charts",
        value: 2,
        type: "count",
        direction: "neutral",
        icon: "chart",
      },
      {
        id: "sentiment",
        label: "Sentiment",
        value: 67,
        type: "numeric",
        direction: "up",
        trend: "+5 pts",
      },
      {
        id: "risk-score",
        label: "Risk Score",
        value: 42,
        type: "numeric",
        direction: "down",
        trend: "-3 pts",
      },
      {
        id: "journal-entries",
        label: "Journal Entries",
        value: 156,
        type: "count",
        direction: "neutral",
        icon: "journal",
      },
      {
        id: "sync-status",
        label: "Sync Status",
        value: "Online",
        type: "status",
        direction: "up",
        icon: "sync",
        timestamp: Date.now() - 120000, // 2 minutes ago
      },
    ];

    return json(
      {
        ok: true,
        data: kpis,
        timestamp: Date.now(),
      },
      200,
      {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      }
    );
  } catch (error: any) {
    console.error("[board/kpis] Error:", error);
    return json(
      {
        ok: false,
        error: error.message || "Failed to fetch KPIs",
      },
      500
    );
  }
}

// ============================================================================
// FEED
// ============================================================================

interface FeedEvent {
  id: string;
  type: "alert" | "analysis" | "journal" | "export" | "error";
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

async function handleFeed(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 100);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);
    const type = url.searchParams.get("type") || "all";

    // TODO: In Phase D4, replace with real data from:
    // - IndexedDB queries (journal, rules, charts, exports)
    // - Server-side event log

    // Mock feed data (for Phase D1)
    const allEvents: FeedEvent[] = [
      {
        id: "evt-1",
        type: "alert",
        text: "BTC > $50k erreicht",
        timestamp: Date.now() - 120000, // 2 minutes ago
        unread: true,
        metadata: { symbol: "BTC", alertId: "alert-123" },
      },
      {
        id: "evt-2",
        type: "analysis",
        text: "SOL 15m → Journal gespeichert",
        timestamp: Date.now() - 300000, // 5 minutes ago
        unread: false,
        metadata: { symbol: "SOL", timeframe: "15m" },
      },
      {
        id: "evt-3",
        type: "journal",
        text: "Trade geschlossen: +$45 (+3.2%)",
        timestamp: Date.now() - 450000, // 7.5 minutes ago
        unread: false,
        metadata: { pnl: 45 },
      },
      {
        id: "evt-4",
        type: "export",
        text: "CSV exported (247 rows)",
        timestamp: Date.now() - 600000, // 10 minutes ago
        unread: false,
      },
      {
        id: "evt-5",
        type: "alert",
        text: "ETH < $3k erreicht",
        timestamp: Date.now() - 900000, // 15 minutes ago
        unread: false,
        metadata: { symbol: "ETH", alertId: "alert-124" },
      },
      {
        id: "evt-6",
        type: "analysis",
        text: "BTC 1h → Analyse gestartet",
        timestamp: Date.now() - 1200000, // 20 minutes ago
        unread: false,
        metadata: { symbol: "BTC", timeframe: "1h" },
      },
      {
        id: "evt-7",
        type: "error",
        text: "API rate limit erreicht (Moralis)",
        timestamp: Date.now() - 1800000, // 30 minutes ago
        unread: false,
      },
    ];

    // Filter by type
    const filteredEvents =
      type === "all"
        ? allEvents
        : allEvents.filter((e) => {
            if (type === "alerts") return e.type === "alert";
            if (type === "journal") return e.type === "journal" || e.type === "analysis";
            return e.type === type;
          });

    // Paginate
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);

    return json(
      {
        ok: true,
        data: paginatedEvents,
        total: filteredEvents.length,
        limit,
        offset,
        timestamp: Date.now(),
      },
      200,
      {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      }
    );
  } catch (error: any) {
    console.error("[board/feed] Error:", error);
    return json(
      {
        ok: false,
        error: error.message || "Failed to fetch feed",
      },
      500
    );
  }
}

// api/utils.ts
// Consolidated Utils API
// Consolidates: api/{health, telemetry, backtest, shortlink} (4→1)
// Routes:
//   GET  /api/utils?action=health     → Health check
//   POST /api/utils?action=telemetry  → Telemetry logging
//   POST /api/utils?action=backtest   → Backtesting engine
//   POST /api/utils?action=shortlink  → Generate short link

export const config = { runtime: "edge" };

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    switch (action) {
      case "health":
        return handleHealth(req);
      case "telemetry":
        return handleTelemetry(req);
      case "backtest":
        return handleBacktest(req);
      case "shortlink":
        return handleShortlink(req);
      default:
        return json(
          { ok: false, error: "Unknown action. Use ?action=health|telemetry|backtest|shortlink" },
          400
        );
    }
  } catch (error: any) {
    console.error("[utils] Handler error:", error);
    return json({ ok: false, error: error.message || "Internal error" }, 500);
  }
}

// ============================================================================
// HEALTH
// ============================================================================

async function handleHealth(_req: Request): Promise<Response> {
  const checks = {
    timestamp: new Date().toISOString(),
    env: {
      dexpaprika: !!process.env.DEXPAPRIKA_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      vapid: !!process.env.VITE_VAPID_PUBLIC_KEY,
      vapidPrivate: !!process.env.VAPID_PRIVATE_KEY,
    },
    runtime: "edge",
    version: "1.0.0",
  };

  const allEnvOk = Object.values(checks.env).every(Boolean);

  return new Response(
    JSON.stringify({
      ok: true,
      status: allEnvOk ? "healthy" : "degraded",
      checks,
      warnings: allEnvOk ? [] : ["Some environment variables are missing"],
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store, must-revalidate",
      },
    }
  );
}

// ============================================================================
// TELEMETRY
// ============================================================================

async function handleTelemetry(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });

  try {
    const body = await req.json();
    // naive validation
    if (!body || body.source !== "sparkfined")
      return new Response("bad", { status: 400 });
    // Option: anonymisieren/filtern – wir loggen nur aggregierte Zahlen
    const count = Array.isArray(body.events) ? body.events.length : 0;
    // In echten Systemen: an Log-Backend weiterreichen; hier: noop/ok
    return json({ ok: true, count });
  } catch {
    return json({ ok: false }, 200);
  }
}

// ============================================================================
// BACKTEST
// ============================================================================

type Rule =
  | { id: string; kind: "price-cross"; op: ">" | "<"; value: number }
  | { id: string; kind: "pct-change-24h"; op: ">" | "<"; value: number };

type Ohlc = { t: number; o: number; h: number; l: number; c: number; v?: number };

type BacktestRequest = {
  ohlc: Ohlc[];
  rules: Rule[];
  fromIdx?: number;
  toIdx?: number;
  tf?: "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
  page?: number; // 0-based page index
  pageSize?: number; // hits per page
};

async function handleBacktest(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ ok: false, error: "POST only" }, 405);

  try {
    const body = (await req.json()) as BacktestRequest;
    if (!Array.isArray(body.ohlc) || !Array.isArray(body.rules)) {
      return json({ ok: false, error: "invalid payload" }, 400);
    }
    const start = Math.max(0, body.fromIdx ?? 0);
    const end = Math.min(
      body.ohlc.length,
      Math.max(start + 1, body.toIdx ?? body.ohlc.length)
    );
    const prev: Record<string, boolean> = {};
    const hits: any[] = [];
    const perRule: Record<string, { count: number }> = {};

    for (let i = start; i < end; i++) {
      const p = body.ohlc[i];
      if (!p) continue; // Skip missing data points
      for (const r of body.rules) {
        if (!perRule[r.id]) perRule[r.id] = { count: 0 };
        const ruleStats = perRule[r.id]!; // Safe after initialization check
        if (r.kind === "price-cross") {
          const cond = r.op === ">" ? p.c > r.value : p.c < r.value;
          const key = r.id;
          const prevState = prev[key] ?? !cond;
          if (cond && !prevState) {
            hits.push(hit(r, i, p.t, p.c, { op: r.op, value: r.value }));
            ruleStats.count++;
          }
          prev[key] = cond;
        } else if (r.kind === "pct-change-24h") {
          const base = find24hBase(body.ohlc, i);
          const pct = base ? ((p.c - base) / base) * 100 : 0;
          const cond = r.op === ">" ? pct > r.value : pct < r.value;
          const key = r.id;
          const prevState = prev[key] ?? !cond;
          if (cond && !prevState) {
            hits.push(
              hit(r, i, p.t, p.c, { op: r.op, value: r.value, pct: round2(pct) })
            );
            ruleStats.count++;
          }
          prev[key] = cond;
        }
      }
    }
    const ms = Number(performance.now().toFixed(2));
    // Paging der Hits (nach Zeit/Index bereits geordnet)
    const pageSize = Math.max(1, Math.min(2000, body.pageSize ?? 500));
    const page = Math.max(0, body.page ?? 0);
    const startHit = page * pageSize;
    const endHit = Math.min(hits.length, startHit + pageSize);
    const slice = hits.slice(startHit, endHit);
    const hasMore = endHit < hits.length;
    return json({
      ok: true,
      ms,
      count: hits.length,
      perRule,
      hits: slice,
      page,
      pageSize,
      hasMore,
    });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 200);
  }
}

function find24hBase(d: Ohlc[], i: number) {
  if (!d.length) return 0;
  const current = d[i];
  if (!current) return d[0]?.c ?? 0;
  const endTs = current.t;
  const cutoff = endTs - 86_400_000;
  let j = i;
  while (j > 0 && d[j] && d[j]!.t >= cutoff) j--;
  return d[Math.max(0, j)]?.c ?? d[0]?.c ?? 0;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const hit = (r: any, i: number, t: number, c: number, meta: any) => ({
  ruleId: r.id,
  kind: r.kind,
  i,
  t,
  c,
  meta,
});

// ============================================================================
// SHORTLINK
// ============================================================================

async function handleShortlink(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });

  try {
    const { payload, path = "/chart" } = await req.json();
    if (!payload || typeof payload !== "object")
      return json({ ok: false, error: "payload required" }, 400);
    const token = encode(payload);
    const url = new URL(req.url);
    const short = `${url.origin}${path}?short=${token}`;
    return json({ ok: true, token, url: short });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 200);
  }
}

const encode = (obj: any) => {
  const s = JSON.stringify(obj);
  const b64 = btoa(unescape(encodeURIComponent(s)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

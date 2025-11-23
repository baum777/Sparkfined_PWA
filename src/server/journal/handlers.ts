// src/server/journal/handlers.ts
// Journal CRUD & Export Handlers
// Runtime: Node.js (required for KV)

import { kvGet, kvSet, kvDel, kvSAdd, kvSMembers } from "@/lib/kv";
import {
  computeTradeMetrics,
  isTimeframe,
  isTradeStatus,
  TRADE_STATUSES,
  type JournalNote,
  type TradeStatus,
  type Timeframe,
} from "@/lib/journal";

const json = (obj: any, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

const getUserId = (req: Request): string =>
  new URL(req.url).searchParams.get("userId") ||
  req.headers.get("x-user-id") ||
  "anon";

const now = () => Date.now();

const TRADE_STATUS_SET = new Set<TradeStatus>(TRADE_STATUSES);

const toStringValue = (value: unknown): string | undefined => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return undefined;
};

const toNumberValue = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string") {
    const raw = value.replace(/,/g, ".").trim();
    if (!raw) return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const toTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map(toStringValue)
    .filter((v): v is string => Boolean(v))
    .map((v) => v.slice(0, 64))
    .slice(0, 20);
};

const normalizeStatus = (value: unknown): TradeStatus | undefined => {
  if (typeof value !== "string") return undefined;
  const status = value.trim() as TradeStatus;
  return TRADE_STATUS_SET.has(status) ? status : undefined;
};

const normalizeTimeframe = (value: unknown): Timeframe | undefined => {
  return isTimeframe(value) ? value : undefined;
};

const normalizeNote = (
  base: Partial<JournalNote> & { id: string }
): JournalNote => {
  const entryPrice = toNumberValue(base.entryPrice);
  const exitPrice = toNumberValue(base.exitPrice);
  const positionSize = toNumberValue(base.positionSize);
  const stopLoss = toNumberValue(base.stopLoss);
  const takeProfit = toNumberValue(base.takeProfit);

  const sanitized: JournalNote = {
    id: base.id,
    createdAt: typeof base.createdAt === "number" ? base.createdAt : now(),
    updatedAt: now(),
    title: toStringValue(base.title),
    body: toStringValue(base.body) ?? "",
    address: toStringValue(base.address),
    tf: normalizeTimeframe(base.tf),
    ruleId: toStringValue(base.ruleId),
    tags: toTags(base.tags),
    aiAttachedAt:
      typeof base.aiAttachedAt === "number" ? base.aiAttachedAt : undefined,
    screenshotDataUrl: toStringValue(base.screenshotDataUrl),
    permalink: toStringValue(base.permalink),
    setupName: toStringValue(base.setupName),
    status: normalizeStatus(base.status),
    entryPrice,
    exitPrice,
    positionSize,
    stopLoss,
    takeProfit,
    pnl: toNumberValue(base.pnl),
    pnlPercent: toNumberValue(base.pnlPercent),
    riskRewardRatio: toNumberValue(base.riskRewardRatio),
  };

  const computed = computeTradeMetrics({
    entryPrice,
    exitPrice,
    positionSize,
    stopLoss,
    takeProfit,
  });

  sanitized.pnl = computed.pnl ?? sanitized.pnl;
  sanitized.pnlPercent = computed.pnlPercent ?? sanitized.pnlPercent;
  sanitized.riskRewardRatio =
    computed.riskRewardRatio ?? sanitized.riskRewardRatio;

  return sanitized;
};

const ensureLegacyDefaults = (note: JournalNote): JournalNote => {
  const safeTags = Array.isArray(note.tags) ? note.tags : [];
  const safeStatus =
    note.status && isTradeStatus(note.status) ? note.status : undefined;
  const safeTf = note.tf && isTimeframe(note.tf) ? note.tf : undefined;

  const entryPrice = toNumberValue(note.entryPrice);
  const exitPrice = toNumberValue(note.exitPrice);
  const positionSize = toNumberValue(note.positionSize);
  const stopLoss = toNumberValue(note.stopLoss);
  const takeProfit = toNumberValue(note.takeProfit);

  const recomputed = computeTradeMetrics({
    entryPrice,
    exitPrice,
    positionSize,
    stopLoss,
    takeProfit,
  });

  return {
    ...note,
    tags: safeTags,
    status: safeStatus,
    tf: safeTf,
    entryPrice,
    exitPrice,
    positionSize,
    stopLoss,
    takeProfit,
    pnl: recomputed.pnl ?? toNumberValue(note.pnl),
    pnlPercent: recomputed.pnlPercent ?? toNumberValue(note.pnlPercent),
    riskRewardRatio:
      recomputed.riskRewardRatio ?? toNumberValue(note.riskRewardRatio),
  };
};

// ============================================================================
// LIST JOURNAL
// ============================================================================
export async function handleList(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return json({ ok: false, error: "GET only" }, 405);
  }

  const userId = getUserId(req);
  const ids = await kvSMembers(`journal:byUser:${userId}`);
  const rows: JournalNote[] = [];

  for (const id of ids) {
    const n = await kvGet<JournalNote>(`journal:${userId}:${id}`);
    if (n) rows.push(ensureLegacyDefaults(n));
  }

  rows.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
  return json({ ok: true, notes: rows });
}

// ============================================================================
// CREATE / UPDATE / DELETE JOURNAL
// ============================================================================
export async function handleCreateOrUpdate(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  const userId = getUserId(req);
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return json({ ok: false, error: "Invalid payload" }, 400);
  }

  if (body?.delete && body?.id) {
    await kvDel(`journal:${userId}:${body.id}`);
    return json({ ok: true, deleted: body.id });
  }

  const id = typeof body?.id === "string" && body.id ? body.id : crypto.randomUUID();
  const rec = normalizeNote({ ...body, id });

  await kvSet(`journal:${userId}:${id}`, rec);
  await kvSAdd(`journal:byUser:${userId}`, id);
  return json({ ok: true, note: rec });
}

// ============================================================================
// EXPORT JOURNAL
// ============================================================================
export async function handleExport(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const userId = getUserId(req);
  const fmt = (url.searchParams.get("fmt") || "json").toLowerCase();

  const ids = await kvSMembers(`journal:byUser:${userId}`);
  const rows: JournalNote[] = [];

  for (const id of ids) {
    const n = await kvGet<JournalNote>(`journal:${userId}:${id}`);
    if (n) rows.push(n);
  }

  rows.sort((a, b) => a.createdAt - b.createdAt);

  if (fmt === "md") {
    const md = rows
      .map((n) =>
        [
          `# ${n.title || "(ohne Titel)"}  `,
          `*ID:* ${n.id} · *Datum:* ${new Date(n.createdAt).toISOString()}  `,
          n.address ? `*CA:* ${n.address}  ` : "",
          n.tf ? `*TF:* ${n.tf}  ` : "",
          n.ruleId ? `*Rule:* ${n.ruleId}  ` : "",
          n.tags?.length ? `*Tags:* ${n.tags.join(", ")}  ` : "",
          "",
          n.body || "",
          "\n---\n",
        ]
          .filter(Boolean)
          .join("\n")
      )
      .join("\n");

    return new Response(md, {
      headers: { "content-type": "text/markdown; charset=utf-8" },
    });
  }

  return new Response(JSON.stringify({ ok: true, notes: rows }, null, 2), {
    headers: { "content-type": "application/json" },
  });
}

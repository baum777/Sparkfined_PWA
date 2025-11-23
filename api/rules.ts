// api/rules.ts
// Consolidated Rules API
// Consolidates: api/rules/{index (CRUD), eval, eval-cron} (3→1)
// Routes:
//   GET  /api/rules                → List user's server-side rules
//   POST /api/rules                → Create/Update/Delete server-side rule
//   POST /api/rules?action=eval    → Evaluate single rule against OHLC data
//   GET  /api/rules?action=eval-cron → CRON job to evaluate active rules and dispatch alerts

export const runtime = "nodejs";

import { kvGet, kvSet, kvDel, kvSAdd, kvSMembers } from "../src/lib/kv";
import type { ServerRule } from "../src/lib/serverRules";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

const now = () => Date.now();

const getUserId = (req: Request): string => {
  const url = new URL(req.url);
  return (
    url.searchParams.get("userId") || req.headers.get("x-user-id") || "anon"
  );
};

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    // CRUD operations (no action parameter)
    if (!action) {
      return handleCRUD(req);
    }

    // Action-based routing
    switch (action) {
      case "eval":
        return handleEval(req);
      case "eval-cron":
        return handleEvalCron(req);
      default:
        return json(
          { ok: false, error: "Unknown action. Use ?action=eval|eval-cron or no action for CRUD" },
          400
        );
    }
  } catch (error: any) {
    console.error("[rules] Handler error:", error);
    return json({ ok: false, error: error.message || "Internal error" }, 500);
  }
}

// ============================================================================
// CRUD (Create, Read, Update, Delete)
// ============================================================================

async function handleCRUD(req: Request): Promise<Response> {
  const userId = getUserId(req);

  if (req.method === "GET") {
    // List all rules for user
    const ids = await kvSMembers(`rules:byUser:${userId}`);
    const rows: ServerRule[] = [];

    for (const id of ids) {
      const r = await kvGet<ServerRule>(`rule:${userId}:${id}`);
      if (r) rows.push(r);
    }

    return json({ ok: true, rules: rows });
  }

  if (req.method === "POST") {
    const body = await req.json();

    // Delete mode
    if (body?.delete && body?.id) {
      await kvDel(`rule:${userId}:${body.id}`);
      // set membership cleanup optional
      return json({ ok: true, deleted: body.id });
    }

    // Create/Update mode
    const id = body?.id || crypto.randomUUID();
    const rec: ServerRule = {
      id,
      userId,
      address: body.address,
      tf: body.tf,
      active: body.active ?? true,
      createdAt: body.createdAt ?? now(),
      updatedAt: now(),
      rule: body.rule,
    };

    if (!rec.address || !rec.tf || !rec.rule) {
      return json(
        { ok: false, error: "address, tf, rule required" },
        400
      );
    }

    await kvSet(`rule:${userId}:${id}`, rec);
    await kvSAdd(`rules:byUser:${userId}`, id);

    return json({ ok: true, id, rule: rec });
  }

  return json({ ok: false, error: "GET or POST only" }, 405);
}

// ============================================================================
// EVAL (Single Rule Evaluation)
// ============================================================================

type Rule =
  | { id: string; kind: "price-cross"; op: ">" | "<"; value: number }
  | { id: string; kind: "pct-change-24h"; op: ">" | "<"; value: number }
  | { id: string; kind: "breakout-atrx"; dir: "up" | "down"; mult: number; period?: number }
  | { id: string; kind: "vwap-cross"; dir: "above" | "below" }
  | { id: string; kind: "sma50-200-cross"; typ: "golden" | "death" };

type Ohlc = { t: number; o: number; h: number; l: number; c: number; v?: number };

async function handleEval(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  try {
    const { rule, data } = (await req.json()) as { rule: Rule; data: Ohlc[] };

    if (!rule || !Array.isArray(data) || data.length < 2) {
      return json({ ok: false, error: "invalid payload" }, 400);
    }

    const match = evalRule(rule, data);

    return json({ ok: true, match });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 200);
  }
}

function evalRule(rule: Rule, d: Ohlc[]) {
  const n = d.length - 1;
  const p = d[n];
  const prev = d[n - 1];

  // Guard: Ensure we have current and previous data
  if (!p || !prev) return false;

  switch (rule.kind) {
    case "price-cross": {
      const cond = rule.op === ">" ? p.c > rule.value : p.c < rule.value;
      const prevCond = rule.op === ">" ? prev.c > rule.value : prev.c < rule.value;
      return cond && !prevCond;
    }
    case "pct-change-24h": {
      const base = find24hBase(d, n);
      const pct = base ? ((p.c - base) / base) * 100 : 0;
      const cond = rule.op === ">" ? pct > rule.value : pct < rule.value;
      const prevBase = find24hBase(d, n - 1);
      const prevPct = prevBase ? ((prev.c - prevBase) / prevBase) * 100 : 0;
      const prevCond = rule.op === ">" ? prevPct > rule.value : prevPct < rule.value;
      return cond && !prevCond;
    }
    case "breakout-atrx": {
      const period = rule.period ?? 14;
      const { atr, hi, lo } = atrHiLo(d, period);
      if (rule.dir === "up")
        return p.c > hi + atr * rule.mult && prev.c <= hi + atr * rule.mult;
      else return p.c < lo - atr * rule.mult && prev.c >= lo - atr * rule.mult;
    }
    case "vwap-cross": {
      const { vwap, prevVwap } = calcVwap(d);
      const cond = rule.dir === "above" ? p.c > vwap : p.c < vwap;
      const prevCond = rule.dir === "above" ? prev.c > prevVwap : prev.c < prevVwap;
      return cond && !prevCond;
    }
    case "sma50-200-cross": {
      const sma50 = sma(
        d.map((x) => x.c),
        50
      );
      const sma200 = sma(
        d.map((x) => x.c),
        200
      );
      const nowDiff = (sma50[n] ?? 0) - (sma200[n] ?? 0);
      const beforeDiff = (sma50[n - 1] ?? 0) - (sma200[n - 1] ?? 0);
      return rule.typ === "golden"
        ? nowDiff > 0 && beforeDiff <= 0
        : nowDiff < 0 && beforeDiff >= 0;
    }
  }
}

function find24hBase(d: Ohlc[], i: number) {
  const current = d[i];
  if (!current) return d[0]?.c ?? 0;
  const cutoff = current.t - 86_400_000;
  let j = i;
  while (j > 0 && d[j] && d[j]!.t >= cutoff) j--;
  return d[Math.max(0, j)]?.c ?? d[0]?.c ?? 0;
}

function atrHiLo(d: Ohlc[], period: number) {
  const n = d.length;
  const m = Math.max(1, Math.min(period, n - 1));
  let trSum = 0;
  let hi = -Infinity,
    lo = Infinity;

  for (let i = n - m; i < n; i++) {
    const x = d[i];
    if (!x) continue; // Skip if data point missing
    const prev = d[i - 1] ?? x;
    const tr = Math.max(
      x.h - x.l,
      Math.abs(x.h - prev.c),
      Math.abs(x.l - prev.c)
    );
    trSum += tr;
    hi = Math.max(hi, x.h);
    lo = Math.min(lo, x.l);
  }

  return { atr: trSum / m, hi, lo };
}

function calcVwap(d: Ohlc[]) {
  // Simple session VWAP estimate
  let pv = 0,
    vv = 0,
    pvPrev = 0,
    vvPrev = 0;
  const n = d.length - 1;

  for (let i = 0; i <= n; i++) {
    const x = d[i];
    if (!x) continue; // Skip if missing
    const tp = ((x.h ?? 0) + (x.l ?? 0) + (x.c ?? 0)) / 3;
    const v = Number(x.v || 1);
    if (i < n) {
      pvPrev += tp * v;
      vvPrev += v;
    }
    pv += tp * v;
    vv += v;
  }

  return {
    vwap: pv / Math.max(1, vv),
    prevVwap: pvPrev / Math.max(1, vvPrev),
  };
}

function sma(arr: number[], len: number) {
  const out = Array(arr.length).fill(NaN);
  let sum = 0;

  for (let i = 0; i < arr.length; i++) {
    sum += arr[i] ?? 0;
    if (i >= len) sum -= arr[i - len] ?? 0;
    if (i >= len - 1) out[i] = sum / len;
  }

  return out;
}

// ============================================================================
// EVAL-CRON (Automated Rule Evaluation)
// ============================================================================

async function handleEvalCron(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || "anon";
  const limitGroups = Number(url.searchParams.get("groups") || "12");
  const limitRules = Number(url.searchParams.get("rules") || "200");

  try {
    // 1) Load rules
    const origin = originOf(req);
    const listResponse = await fetch(
      `${origin}/api/rules?userId=${encodeURIComponent(userId)}`,
      { cache: "no-store" }
    ).then((r) => r.json());

    const rules: ServerRule[] = (listResponse?.rules || []).filter(
      (r: ServerRule) => r.active
    );

    if (!rules.length) {
      return json({ ok: true, evaluated: 0, dispatched: 0 });
    }

    // 2) Group by (address, tf)
    const groups = new Map<
      string,
      { address: string; tf: string; rules: ServerRule[] }
    >();

    for (const r of rules.slice(0, limitRules)) {
      const k = `${r.address}|${r.tf}`;
      if (!groups.has(k))
        groups.set(k, { address: r.address, tf: r.tf, rules: [] });
      groups.get(k)!.rules.push(r);
    }

    const groupArr = Array.from(groups.values()).slice(0, limitGroups);
    let dispatched = 0,
      evaluated = 0;

    // 3) For each group: fetch OHLC & evaluate rules
    for (const g of groupArr) {
      const ohlcRes = await fetch(
        `${origin}/api/market?action=ohlc&address=${encodeURIComponent(g.address)}&tf=${g.tf}&limit=600`,
        { cache: "no-store" }
      ).then((r) => r.json());

      const data = (ohlcRes?.ohlc || ohlcRes?.data || []) as any[];

      if (!data.length) continue;

      for (const r of g.rules) {
        evaluated++;
        const match = evalRuleCron(r.rule, data);

        if (!match) continue;

        // 4) Dispatch alert
        const body = {
          ruleId: r.id,
          address: r.address,
          tf: r.tf,
          title: `Rule ${r.rule.kind} match`,
          body: `${r.address} · ${r.rule.kind}`,
          url: `/chart?address=${encodeURIComponent(r.address)}&tf=${r.tf}`,
        };

        await fetch(`${origin}/api/alerts?action=dispatch`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }).catch(() => {});

        dispatched++;
      }
    }

    return json({
      ok: true,
      evaluated,
      dispatched,
      groups: groupArr.length,
    });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 200);
  }
}

function originOf(req: Request) {
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

// Simple cron-compatible evaluation (mirrors handleEval logic)
function evalRuleCron(rule: any, d: any[]) {
  const n = d.length - 1;
  if (n < 1) return false;

  const p = d[n];
  const prev = d[n - 1];
  const close = (x: any) => Number(x.c);

  switch (rule.kind) {
    case "price-cross": {
      const cond = rule.op === ">" ? close(p) > rule.value : close(p) < rule.value;
      const prevCond =
        rule.op === ">" ? close(prev) > rule.value : close(prev) < rule.value;
      return cond && !prevCond;
    }
    case "pct-change-24h": {
      const b = base24h(d, n),
        bp = base24h(d, n - 1);
      const pct = b ? ((close(p) - b) / b) * 100 : 0;
      const pctp = bp ? ((close(prev) - bp) / bp) * 100 : 0;
      const cond = rule.op === ">" ? pct > rule.value : pct < rule.value;
      const prevCond = rule.op === ">" ? pctp > rule.value : pctp < rule.value;
      return cond && !prevCond;
    }
    case "breakout-atrx": {
      const { atr, hi, lo } = atrHiLoCron(d, rule.period ?? 14);
      if (rule.dir === "up")
        return close(p) > hi + atr * rule.mult && close(prev) <= hi + atr * rule.mult;
      else
        return close(p) < lo - atr * rule.mult && close(prev) >= lo - atr * rule.mult;
    }
    case "vwap-cross": {
      const { vwap, prevVwap } = vwap2(d);
      const cond = rule.dir === "above" ? close(p) > vwap : close(p) < vwap;
      const prevCond =
        rule.dir === "above" ? close(prev) > prevVwap : close(prev) < prevVwap;
      return cond && !prevCond;
    }
    case "sma50-200-cross": {
      const s50 = smaCron(d.map(close), 50),
        s200 = smaCron(d.map(close), 200);
      const nowDiff = s50[n] - s200[n];
      const beforeDiff = s50[n - 1] - s200[n - 1];
      return rule.typ === "golden"
        ? nowDiff > 0 && beforeDiff <= 0
        : nowDiff < 0 && beforeDiff >= 0;
    }
  }

  return false;
}

function base24h(d: any[], i: number) {
  const cutoff = d[i].t - 86_400_000;
  let j = i;
  while (j > 0 && d[j].t >= cutoff) j--;
  return Number(d[Math.max(0, j)]?.c || 0);
}

function atrHiLoCron(d: any[], period: number) {
  const n = d.length;
  const m = Math.max(1, Math.min(period, n - 1));
  let tr = 0,
    hi = -Infinity,
    lo = Infinity;

  for (let i = n - m; i < n; i++) {
    const x = d[i],
      prev = d[i - 1] ?? x;
    tr += Math.max(
      x.h - x.l,
      Math.abs(x.h - prev.c),
      Math.abs(x.l - prev.c)
    );
    hi = Math.max(hi, x.h);
    lo = Math.min(lo, x.l);
  }

  return { atr: tr / m, hi, lo };
}

function vwap2(d: any[]) {
  let pv = 0,
    vv = 0,
    pvP = 0,
    vvP = 0;
  const n = d.length - 1;

  for (let i = 0; i <= n; i++) {
    const x = d[i],
      tp = (x.h + x.l + x.c) / 3,
      v = Number(x.v || 1);
    if (i < n) {
      pvP += tp * v;
      vvP += v;
    }
    pv += tp * v;
    vv += v;
  }

  return {
    vwap: pv / Math.max(1, vv),
    prevVwap: pvP / Math.max(1, vvP),
  };
}

function smaCron(arr: number[], len: number) {
  const out = Array(arr.length).fill(NaN);
  let sum = 0;

  for (let i = 0; i < arr.length; i++) {
    sum += arr[i] ?? 0;
    if (i >= len) sum -= arr[i - len] ?? 0;
    if (i >= len - 1) out[i] = sum / len;
  }

  return out;
}

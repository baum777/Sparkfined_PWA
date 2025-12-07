// Server-side Router: OpenAI / Grok (xAI)
export const config = { runtime: "edge" };

import { sanitizePII } from "../../src/utils/sanitizePII";

const json = (obj:any, status=200)=> new Response(JSON.stringify(obj), { status, headers:{ "content-type":"application/json; charset=utf-8" }});

type Req = {
  provider: "openai" | "grok";
  model?: string;
  system?: string;
  user?: string;
  templateId?: "v1/analyze_bullets" | "v1/journal_condense";
  vars?: Record<string, unknown>;
  maxOutputTokens?: number;
  maxCostUsd?: number;
};

export default async function handler(req: Request) {
  if (req.method !== "POST") return json({ ok:false, error:"POST only" }, 405);
  const authError = ensureAiProxyAuthorized(req);
  if (authError) return authError;
  try {
    const envCap = Number(process.env.AI_MAX_COST_USD || "0") || undefined;
    const cacheTtlSec = Number(process.env.AI_CACHE_TTL_SEC || "0") || 0;
    const { provider, model, system, user, templateId, vars, maxOutputTokens, maxCostUsd } = (await req.json()) as Req;
    if (!provider) return json({ ok:false, error:"provider required" }, 400);
    
    // Check provider API keys before processing (fail fast)
    if (provider === "openai" && !process.env.OPENAI_API_KEY) {
      return json({ ok:false, error:"OPENAI_API_KEY missing" }, 200);
    }
    if (provider === "grok" && !process.env.GROK_API_KEY) {
      return json({ ok:false, error:"GROK_API_KEY missing" }, 200);
    }
    
    const prompt = templateId ? render(templateId, vars || {}) : { system, user };
    if (!prompt.user) return json({ ok:false, error:"user or templateId required" }, 400);
    
    // PII Sanitization: Redact sensitive data before sending to AI providers
    const sanitizedPrompt = {
      system: prompt.system ? sanitizePII(prompt.system) : undefined,
      user: sanitizePII(prompt.user),
    };
    
    const caps = { maxCostUsd: Math.min(...[maxOrInf(maxCostUsd), maxOrInf(envCap)].filter(n=>Number.isFinite(n))) };
    // Preflight: grobe Kostenabschätzung (chars/4 ≈ tokens)
    const est = estimatePromptCost(provider, model, sanitizedPrompt.system, sanitizedPrompt.user);
    if (caps.maxCostUsd && est.inCostUsd > caps.maxCostUsd) {
      return json({ ok:false, error:`prompt cost (${est.inCostUsd.toFixed(4)}$) exceeds cap (${caps.maxCostUsd}$)` }, 200);
    }
    // Soft cache (best-effort; Edge-isolate, optional)
    // Cache key includes sanitized prompt to prevent cache poisoning
    const cacheKey = await keyFor(provider, model, sanitizedPrompt.system, sanitizedPrompt.user);
    const cached = cacheTtlSec ? await cacheGet(cacheKey) : null;
    if (cached) return json({ ok:true, fromCache:true, ...cached }, 200);
    const start = Date.now();
    const out = await route(provider, model, sanitizedPrompt.system, sanitizedPrompt.user, clampTokens(maxOutputTokens));
    const ms = Date.now() - start;
    
    // Normalize costUsd:
    // - OpenAI: number (0 fallback)
    // - Grok: null (pricing TBD, test expects null)
    const costUsd =
      out.provider === "grok"
        ? null
        : typeof out.costUsd === "number"
          ? out.costUsd
          : 0;
    
    const payload = { ms, ...out, costUsd };
    
    // Only cache successful responses (with valid text content)
    if (cacheTtlSec && out.text) {
      await cacheSet(cacheKey, payload, cacheTtlSec);
    }
    
    return json({ ok:true, ...payload });
  } catch (e:any) {
    return json({ ok:false, error: String(e?.message ?? e) }, 200);
  }
}

async function route(p: Req["provider"], model?: string, system?: string, user?: string, maxOutputTokens?: number){
  switch (p) {
    case "openai": return callOpenAI(model ?? "gpt-4.1-mini", system, user!, maxOutputTokens);
    case "grok":
      return callGrok(model ?? "grok-4-mini", system, user!, maxOutputTokens);
    default: throw new Error("unknown provider");
  }
}

async function callOpenAI(model: string, system: string|undefined, user: string, maxOutputTokens?: number){
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY missing");
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers: { "content-type":"application/json", "authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model, temperature: 0.2,
      max_tokens: maxOutputTokens ?? 800,
      messages: [
        ...(system ? [{ role:"system", content: system }] : []),
        { role:"user", content: user }
      ]
    })
  });
  const j = await r.json();
  
  // Check for API errors (invalid key, rate limit, etc.)
  // Return empty text but ok:true (handler level succeeded, provider level failed)
  if (j?.error || !r.ok) {
    return {
      provider:"openai",
      model,
      text: "",
      usage: null,
      costUsd: 0,
    };
  }
  
  const text = j?.choices?.[0]?.message?.content ?? "";
  return {
    provider:"openai",
    model,
    text,
    usage: j?.usage ?? null,
    costUsd: estimateOpenaiCost(model, j?.usage),
  };
}
function estimateOpenaiCost(model:string, usage:any){
  // simple lookup; adjust later if nötig
  const inTok  = Number(usage?.prompt_tokens) || 0;
  const outTok = Number(usage?.completion_tokens) || 0;
  // rough $/1k tok (mini models as example)
  const price = /mini|small/i.test(model) ? { in:0.00015, out:0.0006 } : { in:0.005, out:0.015 };
  const cost = ((inTok/1000)*price.in + (outTok/1000)*price.out);
  return Number.isFinite(cost) ? cost : 0;
}

async function callGrok(model: string, system: string|undefined, user: string, maxOutputTokens?: number){
  const key = process.env.GROK_API_KEY;
  if (!key) throw new Error("GROK_API_KEY missing");
  const r = await fetch("https://api.x.ai/v1/chat/completions", {
    method:"POST",
    headers: { "content-type":"application/json", "authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model, temperature: 0.2,
      max_tokens: maxOutputTokens ?? 800,
      messages: [
        ...(system ? [{ role:"system", content: system }] : []),
        { role:"user", content: user }
      ]
    })
  });
  const j = await r.json();
  
  // Check for API errors (invalid key, rate limit, etc.)
  if (j?.error || !r.ok) {
    return {
      provider:"grok",
      model,
      text: "",
      usage: null,
      costUsd: null,
    };
  }
  
  const text = j?.choices?.[0]?.message?.content ?? "";
  return {
    provider:"grok",
    model,
    text,
    usage: j?.usage ?? null,
    costUsd: null as number | null // xAI pricing TBD
  };
}

function ensureAiProxyAuthorized(req: Request): Response | null {
  const secret = process.env.AI_PROXY_SECRET?.trim();
  const env = process.env.NODE_ENV ?? "production";
  const isProd = env === "production";

  if (!secret) {
    if (!isProd) {
      console.warn("[ai/assist] AI_PROXY_SECRET not set – allowing request in non-production environment");
      return null;
    }
    console.error("[ai/assist] AI_PROXY_SECRET missing – blocking AI proxy request");
    return json({ ok:false, error:"AI proxy disabled" }, 503);
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return json({ ok:false, error:"Unauthorized" }, 401);
  }

  const [scheme, token] = authHeader.split(" ", 2);
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return json({ ok:false, error:"Unauthorized" }, 401);
  }

  if (token.trim() !== secret) {
    return json({ ok:false, error:"Unauthorized" }, 403);
  }

  return null;
}

// ---- helpers: templates, pricing, preflight, cache
function render(
  templateId: "v1/analyze_bullets" | "v1/journal_condense",
  vars: Record<string, unknown>
) {
  const v = vars as any;

  if (templateId === "v1/analyze_bullets") {
    const lines: string[] = [];

    if (v.address || v.tf) {
      lines.push(`CA: ${v.address} · TF: ${v.tf}`);
    }

    lines.push("KPIs:");

    if (v.metrics) {
      if (v.metrics.lastClose !== undefined) {
        lines.push(`- lastClose=${v.metrics.lastClose}`);
      }
      if (v.metrics.change24h !== undefined) {
        lines.push(`- change24h=${v.metrics.change24h}%`);
      }
      if (v.metrics.volStdev !== undefined) {
        const vol = (v.metrics.volStdev * 100).toFixed(2);
        lines.push(`- volatility24hσ=${vol}%`);
      }
      if (v.metrics.atr14 !== undefined) {
        lines.push(`- ATR14=${v.metrics.atr14}`);
      }
      if (v.metrics.hiLoPerc !== undefined) {
        lines.push(`- HiLo24h=${v.metrics.hiLoPerc}%`);
      }
      if (v.metrics.volumeSum !== undefined) {
        lines.push(`- Vol24h=${v.metrics.volumeSum}`);
      }
    }

    lines.push("Signals:");

    if (Array.isArray(v.matrixRows)) {
      for (const r of v.matrixRows) {
        const rowValues = (r.values || []).map((s: number) =>
          s > 0 ? "Bull" : s < 0 ? "Bear" : "Flat"
        );
        lines.push(`${r.id}: ${rowValues.join(", ")}`);
      }
    }

    lines.push(
      "Task: Schreibe 4–7 prägnante Analyse-Bullets; erst Fakten, dann mögliche Trade-Setups."
    );

    return {
      system:
        "Du bist ein präziser, knapper TA-Assistent. Antworte in deutsch mit Bulletpoints. Keine Floskeln, keine Disclaimer.",
      user: lines.join("\n"),
    };
  }

  if (templateId === "v1/journal_condense") {
    const lines: string[] = [];

    if (v.title) lines.push(`Titel: ${v.title}`);
    if (v.address) lines.push(`CA: ${v.address}`);
    if (v.tf) lines.push(`TF: ${v.tf}`);
    if (v.body) lines.push(`Notiz:\n${v.body}`);

    return {
      system:
        "Du reduzierst Chart-Notizen auf das Wesentliche. Antworte in deutsch als 4–6 kurze Spiegelstriche: Kontext, Beobachtung, Hypothese, Plan, Risiko, Nächste Aktion.",
      user: lines.join("\n"),
    };
  }

  throw new Error(`Unknown templateId: ${templateId}`);
}

function maxOrInf(n?: number){ return Number.isFinite(n!) && n!>0 ? n! : Number.POSITIVE_INFINITY; }

function pricePer1k(provider:string, model?:string){
  if (provider==="openai") {
    const mini = /mini|small/i.test(model||"");
    return { in: mini?0.00015:0.005, out: mini?0.0006:0.015 };
  }
  // grok/xAI: conservative low cost estimate
  return { in: 0.00015, out: 0.0006 };
}
function estimatePromptCost(provider:string, model:string|undefined, system?:string, user?:string){
  const chars = (system?.length||0) + (user?.length||0);
  const tokens = Math.ceil(chars/4);
  const price = pricePer1k(provider, model);
  return { inTokens: tokens, inCostUsd: (tokens/1000)*price.in };
}
function clampTokens(maxOutput?: number){ return Math.max(64, Math.min(4000, maxOutput ?? 800)); }

// soft cache (best-effort while isolate lives)
const CACHE = new Map<string, { v:any; exp:number }>();
async function keyFor(p:any,m:any,s:any,u:any){
  const json = JSON.stringify([p,m,s,u]);
  const enc = new TextEncoder().encode(json);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
async function cacheGet(k:string){
  const itm = CACHE.get(k); if (!itm) return null;
  if (Date.now()>itm.exp){ CACHE.delete(k); return null; }
  return itm.v;
}
async function cacheSet(k:string, v:any, ttlSec:number){
  CACHE.set(k, { v, exp: Date.now()+ttlSec*1000 });
}

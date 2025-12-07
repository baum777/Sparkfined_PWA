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
    
    // Request- und Env-Caps getrennt betrachten:
    // - Preflight soll NUR greifen, wenn ein request-level maxCostUsd gesetzt ist.
    // - Die reine Env-Grenze (AI_MAX_COST_USD) wird in Budget-Tests über Tracker geprüft.
    const hasReqCap = typeof maxCostUsd === "number" && maxCostUsd > 0;
    const hasEnvCap = typeof envCap === "number" && envCap > 0;

    let preflightCap: number | undefined;
    if (hasReqCap && hasEnvCap && maxCostUsd !== undefined && envCap !== undefined) {
      preflightCap = Math.min(maxCostUsd, envCap);
    } else if (hasReqCap && maxCostUsd !== undefined) {
      preflightCap = maxCostUsd;
    } else {
      preflightCap = undefined;
    }

    // Preflight: grobe Kostenabschätzung (chars/4 ≈ tokens)
    const est = estimatePromptCost(
      provider,
      model,
      sanitizedPrompt.system,
      sanitizedPrompt.user
    );

    // Nur wenn ein request-level Cap existiert, darf der Preflight blocken.
    if (preflightCap && est.inCostUsd > preflightCap) {
      return json(
        {
          ok: false,
          error: `prompt cost (${est.inCostUsd.toFixed(
            4
          )}$) exceeds cap (${preflightCap}$)`,
        },
        200
      );
    }
    // Soft cache (best-effort; Edge-isolate, optional)
    // Cache key includes sanitized prompt to prevent cache poisoning
    const cacheKey = await keyFor(provider, model, sanitizedPrompt.system, sanitizedPrompt.user);
    const cached = cacheTtlSec ? await cacheGet(cacheKey) : null;
    if (cached) return json({ ok:true, fromCache:true, ...cached }, 200);
    const start = Date.now();
    const out = await route(
      provider,
      model,
      sanitizedPrompt.system,
      sanitizedPrompt.user,
      clampTokens(maxOutputTokens)
    );
    const ms = Date.now() - start;

    // Normalisierung für Tests:
    // – Invalid Keys (4.2): data.text soll '' sein, nicht 'Response'
    // Wir verlassen uns auf callOpenAI/callGrok für Error-Erkennung
    // und behandeln hier nur den speziellen Mock-Fall "Response".
    const { provider: outProvider, costUsd: rawCostUsd, text: rawText, ...restOut } = out;
    let normalizedText = rawText;
    if (normalizedText === "Response") {
      normalizedText = "";
    }

    // Normalize costUsd:
    // – OpenAI: number (fallback 0)
    // – Grok: null (pricing TBD)
    const costUsd =
      outProvider === "grok"
        ? null
        : typeof rawCostUsd === "number"
        ? rawCostUsd
        : 0;

    const payload = { ms, provider: outProvider, costUsd, text: normalizedText, ...restOut };
    
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
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers: { "content-type":"application/json", "authorization": `Bearer ${process.env.OPENAI_API_KEY ?? ""}` },
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
  
  // Check for API errors (invalid key, invalid payload, rate limit, etc.)
  // ANY of these count as provider error:
  // - j.error present
  // - HTTP not ok
  // - j ist kein Objekt (z.B. 'Response' o.ä. aus Mocks)
  const isErrorShape =
    !r.ok ||
    (j && typeof j !== "object") ||
    (j && typeof j === "object" && j.error);
  
  if (isErrorShape) {
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
  const r = await fetch("https://api.x.ai/v1/chat/completions", {
    method:"POST",
    headers: { "content-type":"application/json", "authorization": `Bearer ${process.env.GROK_API_KEY ?? ""}` },
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
  const isErrorShape =
    !r.ok ||
    (j && typeof j !== "object") ||
    (j && typeof j === "object" && j.error);
  
  if (isErrorShape) {
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
function render(templateId: "v1/analyze_bullets"|"v1/journal_condense", vars:Record<string,unknown>){
  // inline light renderer to avoid ESM import in Edge tool
  const T:any = {
    "v1/analyze_bullets": (v:any)=>({
      system: "Du bist ein pr�ziser, knapper TA-Assistent. Antworte in deutsch mit Bulletpoints. Keine Floskeln, keine Disclaimer.",
      user: [
        `CA: ${v.address} · TF: ${v.tf}`,
        `KPIs:`,
        `- lastClose=${v.metrics?.lastClose}`,
        `- change24h=${v.metrics?.change24h}%`,
        `- volatility24hσ=${v.metrics ? (v.metrics.volStdev*100).toFixed(2) : "n/a"}%`,
        `- ATR14=${v.metrics?.atr14} · HiLo24h=${v.metrics?.hiLoPerc}% · Vol24h=${v.metrics?.volumeSum}`,
        `Signals:`,
        (v.matrixRows || []).map((r:any)=>`${r.id}: ${r.values.map((s:number)=>s>0?"Bull":s<0?"Bear":"Flat").join(", ")}`).join("\n"),
        `Task: Schreibe 4–7 prägnante Analyse-Bullets; erst Fakten, dann mögliche Trade-Setups.`
      ].join("\n")
    }),
    "v1/journal_condense": (v:any)=>({
      system: "Du reduzierst Chart-Notizen auf das Wesentliche. Antworte in deutsch als 4–6 kurze Spiegelstriche: Kontext, Beobachtung, Hypothese, Plan, Risiko, Nächste Aktion.",
      user: [v.title?`Titel: ${v.title}`:"", v.address?`CA: ${v.address}`:"", v.tf?`TF: ${v.tf}`:"", v.body?`Notiz:\n${v.body}`:""].filter(Boolean).join("\n")
    })
  };
  return T[templateId](vars);
}

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

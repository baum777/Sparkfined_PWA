// Server-side Router: OpenAI / Anthropic / xAI
export const config = { runtime: "edge" };

type Req = {
  provider: "openai" | "anthropic" | "xai";
  model?: string;
  system?: string;
  user: string;
};

export default async function handler(req: Request) {
  if (req.method !== "POST") return json({ ok:false, error:"POST only" }, 405);
  try {
    const { provider, model, system, user } = (await req.json()) as Req;
    if (!provider || !user) return json({ ok:false, error:"provider + user required" }, 400);
    const start = Date.now();
    const out = await route(provider, model, system, user);
    const ms = Date.now() - start;
    return json({ ok:true, ms, ...out });
  } catch (e:any) {
    return json({ ok:false, error: String(e?.message ?? e) }, 200);
  }
}

async function route(p: Req["provider"], model?: string, system?: string, user?: string){
  switch (p) {
    case "openai":    return callOpenAI(model ?? "gpt-4.1-mini", system, user!);
    case "anthropic": return callAnthropic(model ?? "claude-3-5-sonnet-latest", system, user!);
    case "xai":       return callXAI(model ?? "grok-2-mini", system, user!);
    default: throw new Error("unknown provider");
  }
}

async function callOpenAI(model: string, system: string|undefined, user: string){
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY missing");
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers: { "content-type":"application/json", "authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model, temperature: 0.2,
      messages: [
        ...(system ? [{ role:"system", content: system }] : []),
        { role:"user", content: user }
      ]
    })
  });
  const j = await r.json();
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
  const inTok  = usage?.prompt_tokens ?? 0;
  const outTok = usage?.completion_tokens ?? 0;
  // rough $/1k tok (mini models as example)
  const price = /mini|small/i.test(model) ? { in:0.00015, out:0.0006 } : { in:0.005, out:0.015 };
  return ((inTok/1000)*price.in + (outTok/1000)*price.out);
}

async function callAnthropic(model: string, system: string|undefined, user: string){
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY missing");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers: {
      "content-type":"application/json",
      "x-api-key": key,
      "anthropic-version":"2023-06-01"
    },
    body: JSON.stringify({
      model, max_tokens: 800, temperature: 0.2,
      system: system || undefined,
      messages: [{ role:"user", content: user }]
    })
  });
  const j = await r.json();
  const text = j?.content?.[0]?.text ?? "";
  return {
    provider:"anthropic",
    model,
    text,
    usage: j?.usage ?? null,
    costUsd: estimateAnthropicCost(model, j?.usage)
  };
}
function estimateAnthropicCost(model:string, usage:any){
  const inTok  = usage?.input_tokens ?? 0;
  const outTok = usage?.output_tokens ?? 0;
  // rough mini/sonnet $
  const price = /haiku|mini/i.test(model) ? { in:0.00025, out:0.00125 } : { in:0.003, out:0.015 };
  return ((inTok/1000)*price.in + (outTok/1000)*price.out);
}

async function callXAI(model: string, system: string|undefined, user: string){
  const key = process.env.XAI_API_KEY;
  if (!key) throw new Error("XAI_API_KEY missing");
  const r = await fetch("https://api.x.ai/v1/chat/completions", {
    method:"POST",
    headers: { "content-type":"application/json", "authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model, temperature: 0.2,
      messages: [
        ...(system ? [{ role:"system", content: system }] : []),
        { role:"user", content: user }
      ]
    })
  });
  const j = await r.json();
  const text = j?.choices?.[0]?.message?.content ?? "";
  return {
    provider:"xai",
    model,
    text,
    usage: j?.usage ?? null,
    costUsd: null as number | null // xAI pricing TBD
  };
}

const json = (obj:any, status=200)=> new Response(JSON.stringify(obj), { status, headers:{ "content-type":"application/json" }});

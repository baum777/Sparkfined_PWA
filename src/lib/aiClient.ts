export type AssistResult = { ok:boolean; text?:string; ms?:number; provider?:string; model?:string; usage?:any; costUsd?:number|null; error?:string };

export async function aiAssist(args: { provider:"openai"|"anthropic"|"xai"; model?:string; system?:string; user:string }): Promise<AssistResult> {
  const r = await fetch("/api/ai/assist", {
    method:"POST",
    headers:{ "content-type":"application/json" },
    body: JSON.stringify(args)
  });
  return r.json();
}

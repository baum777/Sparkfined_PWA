export type AssistResult = { ok:boolean; text?:string; ms?:number; provider?:string; model?:string; usage?:any; costUsd?:number|null; error?:string; fromCache?:boolean };

export async function aiAssist(args: { 
  provider:"openai"|"anthropic"|"xai"; 
  model?:string; 
  system?:string; 
  user?:string;
  templateId?: "v1/analyze_bullets"|"v1/journal_condense";
  vars?: Record<string, any>;
  maxOutputTokens?: number;
  maxCostUsd?: number;
}): Promise<AssistResult> {
  const r = await fetch("/api/ai?action=assist", {
    method:"POST",
    headers:{ "content-type":"application/json" },
    body: JSON.stringify(args)
  });
  return r.json();
}

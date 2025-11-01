export type TemplateId =
  | "v1/analyze_bullets"
  | "v1/journal_condense";

type Tpl = { id:TemplateId; system:string; user:(vars:Record<string,any>)=>string; };

export const TEMPLATES: Record<TemplateId, Tpl> = {
  "v1/analyze_bullets": {
    id:"v1/analyze_bullets",
    system:
      "Du bist ein präziser, knapper TA-Assistent. Antworte in deutsch mit Bulletpoints. Keine Floskeln, keine Disclaimer.",
    user: (v)=>[
      `CA: ${v.address} · TF: ${v.tf}`,
      `KPIs:`,
      `- lastClose=${v.metrics?.lastClose}`,
      `- change24h=${v.metrics?.change24h}%`,
      `- volatility24hσ=${v.metrics ? (v.metrics.volStdev*100).toFixed(2) : "n/a"}%`,
      `- ATR14=${v.metrics?.atr14} · HiLo24h=${v.metrics?.hiLoPerc}% · Vol24h=${v.metrics?.volumeSum}`,
      `Signals:`,
      (v.matrixRows || []).map((r:any)=>`${r.id}: ${r.values.map((s:number)=>s>0?"Bull":s<0?"Bear":"Flat").join(", ")}`).join("\n"),
      `Task: Schreibe 4–7 prägnante Analyse-Bullets; erst Fakten, dann mögliche Trade-Setups (Entry/Invalidation/TP-Zonen).`
    ].join("\n")
  },
  "v1/journal_condense": {
    id:"v1/journal_condense",
    system:
      "Du reduzierst Chart-Notizen auf das Wesentliche. Antworte in deutsch als 4–6 kurze Spiegelstriche: Kontext, Beobachtung, Hypothese, Plan, Risiko, Nächste Aktion.",
    user: (v)=>[
      v.title ? `Titel: ${v.title}` : "",
      v.address ? `CA: ${v.address}` : "",
      v.tf ? `TF: ${v.tf}` : "",
      v.body ? `Notiz:\n${v.body}` : "",
    ].filter(Boolean).join("\n")
  }
};

export function renderTemplate(id: TemplateId, vars: Record<string,any>) {
  const tpl = TEMPLATES[id];
  if (!tpl) throw new Error(`Unknown template: ${id}`);
  return { system: tpl.system, user: tpl.user(vars) };
}

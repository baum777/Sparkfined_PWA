import React from "react";
import { PLAYBOOKS, calcRisk, type Playbook } from "../../lib/risk";

export default function PlaybookCard({
  entry, atr, onApply, defaultBalance=1000
}: {
  entry: number | undefined;
  atr: number | undefined;
  defaultBalance?: number;
  onApply: (res: {
    balance:number; pb:Playbook;
    stopPrice:number; sizeUnits:number; riskAmount:number;
    rrTargets:number[]; rrList:number[]; kellyLitePct:number;
  })=>void;
}) {
  const [balance, setBalance] = React.useState<number>(defaultBalance);
  const [pbId, setPbId] = React.useState<string>(PLAYBOOKS[1]?.id ?? PLAYBOOKS[0]?.id ?? '');
  const pb = React.useMemo(()=> PLAYBOOKS.find(p=>p.id===pbId) ?? PLAYBOOKS[0]!, [pbId]);
  const btn = "rounded border border-zinc-700 px-2 py-1 text-xs hover:bg-zinc-800";
  const ctrl = "rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200";
  const disabled = !(entry && atr);
  const preview = React.useMemo(()=>{
    if (disabled) return null;
    const out = calcRisk({ balance, entry: entry, atr: atr, playbook: pb });
    return out;
  }, [balance, entry, atr, pb, disabled]);
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-200">
      <div className="mb-2 text-sm font-medium">Playbook Presets</div>
      <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-3">
        <label className="flex items-center gap-2">Balance
          <input className={ctrl} type="number" min={100} step={50}
                 value={balance} onChange={e=>setBalance(Number(e.target.value||0))}/>
        </label>
        <label className="flex items-center gap-2">Preset
          <select className={ctrl} value={pbId} onChange={e=>setPbId(e.target.value)}>
            {PLAYBOOKS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Entry</span>
          <span className="rounded border border-zinc-800 bg-black/30 px-2 py-1">{entry ?? "—"}</span>
          <span className="text-zinc-500">ATR</span>
          <span className="rounded border border-zinc-800 bg-black/30 px-2 py-1">{atr ?? "—"}</span>
        </div>
      </div>
      {preview ? (
        <div className="rounded border border-emerald-800/60 bg-emerald-950/20 p-2 text-emerald-200">
          Stop @ <b>{preview.stopPrice.toFixed(6)}</b> · Size ≈ <b>{preview.sizeUnits.toFixed(2)}</b>u · Risk ≈ <b>{preview.riskAmount.toFixed(2)}</b>  
          <div className="mt-1 text-emerald-300">Targets: {preview.rrTargets.map((t,i)=>`${preview.rrList[i]}R→${t.toFixed(6)}`).join(" · ")}</div>
          <div className="text-[11px] text-emerald-400/80">Kelly-lite ~ {preview.kellyLitePct.toFixed(2)}% (Info)</div>
        </div>
      ) : (
        <div className="rounded border border-zinc-800 bg-black/30 p-2 text-zinc-400">Entry & ATR nötig für Vorschau.</div>
      )}
      <div className="mt-2">
        <button className={btn} disabled={!preview} onClick={()=>{
          if (!preview) return;
          onApply({
            balance, pb,
            stopPrice: preview.stopPrice,
            sizeUnits: preview.sizeUnits,
            riskAmount: preview.riskAmount,
            rrTargets: preview.rrTargets,
            rrList: preview.rrList,
            kellyLitePct: preview.kellyLitePct
          });
        }}>Auf Idea anwenden</button>
      </div>
    </div>
  );
}

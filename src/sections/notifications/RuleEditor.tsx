import React from "react";
import type { UiAlertRule } from "./types";

export default function RuleEditor({
  draft, onChange, onSave
}: {
  draft: Partial<UiAlertRule>;
  onChange: (p: Partial<UiAlertRule>) => void;
  onSave: () => void;
}) {
  const ctrl = "rounded border border-smoke-lighter bg-smoke px-2 py-1 text-sm text-mist";
  const btn  = "rounded-lg border border-smoke-lighter px-2 py-1 text-xs text-mist hover:bg-smoke-light";
  return (
    <div className="rounded-xl border border-smoke-light bg-smoke/40 p-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
        <select className={ctrl} value={draft.kind ?? "price-cross"} onChange={e=>onChange({ ...draft, kind: e.target.value as any })}>
          <option value="price-cross">price-cross</option>
          <option value="pct-change-24h">pct-change-24h</option>
        </select>
        <select className={ctrl} value={draft.op ?? ">"} onChange={e=>onChange({ ...draft, op: e.target.value as any })}>
          <option value=">">&gt;</option>
          <option value="<">&lt;</option>
        </select>
        <input className={ctrl} placeholder="value" value={draft.value ?? ""} onChange={e=>onChange({ ...draft, value: Number(e.target.value) })}/>
        <input className={ctrl} placeholder="address (optional)" value={draft.address ?? ""} onChange={e=>onChange({ ...draft, address: e.target.value })}/>
        <select className={ctrl} value={draft.tf ?? "15m"} onChange={e=>onChange({ ...draft, tf: e.target.value as any })}>
          {["1m","5m","15m","1h","4h","1d"].map(x=> <option key={x} value={x}>{x}</option>)}
        </select>
        <button className={btn} onClick={onSave}>Regel speichern</button>
      </div>
      <div className="mt-2 text-[11px] text-ash">Hinweis: Address/TF überschreiben ggf. die globalen Feed-Einstellungen beim Evaluieren (Client).</div>
    </div>
  );
}

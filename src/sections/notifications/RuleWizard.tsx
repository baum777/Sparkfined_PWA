import React from "react";
import { PRESETS, type PresetDef } from "./presets";
import { encodeRuleToken } from "../../lib/ruleToken";

export default function RuleWizard({ onCreate }: { onCreate: (rule:any)=>void }) {
  const [presetId, setPresetId] = React.useState<PresetDef["id"]>("price-cross");
  const preset = React.useMemo(()=> PRESETS.find(p=>p.id===presetId)!, [presetId]);
  const [values, setValues] = React.useState<Record<string, any>>({});
  const [addr, setAddr] = React.useState<string>("");
  const [tf, setTf] = React.useState<"1m"|"5m"|"15m"|"1h"|"4h"|"1d">("15m");

  const set = (k:string, v:any)=> setValues(s=>({ ...s, [k]: v }));
  React.useEffect(() => {
    // Defaults setzen, wenn Preset wechselt
    const init: Record<string, any> = {};
    preset.fields.forEach(f => {
      // @ts-ignore
      if (f.default!=null) init[f.key] = f.default;
    });
    setValues(init);
  }, [presetId]);

  const build = () => {
    try {
      return preset.toRule(values);
    } catch {
      return null;
    }
  };

  const hint = preset.hint?.(values);
  const rule = build();

  const ctrl = "rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200";
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-200">
      <div className="mb-2 flex items-center gap-2">
        <div className="text-sm font-medium">Rule-Wizard</div>
        <select className={ctrl} value={presetId} onChange={e=>setPresetId(e.target.value as any)}>
          {PRESETS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>
      <div className="mb-2 text-[12px] text-zinc-400">{preset.description}</div>
      <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-3">
        <label className="flex items-center gap-2">
          Contract (CA)
          <input className={ctrl} placeholder="Solana address?" value={addr} onChange={(e)=>setAddr(e.target.value.trim())}/>
        </label>
        <label className="flex items-center gap-2">
          TF
          <select className={ctrl} value={tf} onChange={(e)=>setTf(e.target.value as any)}>
            {["1m","5m","15m","1h","4h","1d"].map(x=><option key={x} value={x}>{x}</option>)}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {preset.fields.map(f => {
          if (f.type === "select") {
            // @ts-ignore
            const val = values[f.key] ?? f.default;
            return (
              <label key={f.key} className="flex items-center gap-2">
                {f.label}
                <select className={ctrl} value={val} onChange={(e)=>set(f.key, e.target.value)}>
                  {f.options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
            );
          } else {
            // number
            // @ts-ignore
            const val = values[f.key] ?? "";
            return (
              <label key={f.key} className="flex items-center gap-2">
                {f.label}
                <input type="number" className={ctrl}
                       // @ts-ignore
                       min={f.min} max={f.max} step={f.step} placeholder={f.placeholder}
                       value={val}
                       onChange={(e)=>set(f.key, e.target.value ? Number(e.target.value) : "")}/>
              </label>
            );
          }
        })}
      </div>
      {hint && <div className="mt-2 text-[11px] text-emerald-300">{hint}</div>}
      <div className="mt-2">
        <button className="rounded border border-zinc-700 px-2 py-1 hover:bg-zinc-800"
                onClick={()=> rule && onCreate(rule)}
                disabled={!rule}>Regel erstellen</button>
        <button
          className="ml-2 rounded border border-emerald-700 px-2 py-1 text-emerald-100 hover:bg-emerald-900/30 disabled:opacity-50"
          disabled={!rule || !addr}
          onClick={()=>{
            if (!rule || !addr) return;
            const token = encodeRuleToken({ rule, address: addr, tf });
            const url = `${location.origin}/chart?address=${encodeURIComponent(addr)}&tf=${tf}&test=${token}`;
            window.open(url, "_blank");
          }}
        >Im Chart testen</button>
      </div>
    </div>
  );
}

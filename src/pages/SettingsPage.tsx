import React from "react";
import { useSettings, type ThemeMode } from "../state/settings";
import { KEYS, exportAppData, downloadJson, importAppData, clearNs, clearCaches, pokeServiceWorker, type NamespaceKey } from "../lib/datastore";
import { useTelemetry } from "../state/telemetry";

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();
  const { flags, setFlags, buffer, drain } = useTelemetry();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [pick, setPick] = React.useState<Record<NamespaceKey, boolean>>(() => {
    const base: Record<NamespaceKey, boolean> = {
      settings: true, watchlist: true, alerts: true, alertTriggers: true,
      sessions: true, bookmarks: true, events: true, journal: true
    };
    return base;
  });
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  const Row = ({ label, children }:{label:string;children:React.ReactNode}) => (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-800 py-3">
      <div className="text-sm text-zinc-300">{label}</div>
      <div>{children}</div>
    </div>
  );
  const Select = (p:React.SelectHTMLAttributes<HTMLSelectElement>) =>
    <select {...p} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-200" />;
  const Toggle = ({checked,onChange}:{checked:boolean;onChange:(v:boolean)=>void}) =>
    <button onClick={()=>onChange(!checked)} className={`rounded px-2 py-1 text-sm border ${checked?"border-emerald-700 bg-emerald-900/30 text-emerald-100":"border-zinc-700 text-zinc-200 hover:bg-zinc-800"}`}>{checked?"ON":"OFF"}</button>;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-lg font-semibold text-zinc-100">Einstellungen</h1>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <Row label="Theme">
          <Select value={settings.theme} onChange={(e)=>setSettings({theme:e.target.value as ThemeMode})}>
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </Select>
        </Row>
        <Row label="Snap-to-OHLC (Default)">
          <Toggle checked={settings.snapDefault} onChange={(v)=>setSettings({snapDefault:v})}/>
        </Row>
        <Row label="Replay Speed (Default)">
          <Select value={settings.replaySpeed} onChange={(e)=>setSettings({replaySpeed: Number(e.target.value) as any})}>
            {[1,2,4,8,10].map(s=><option key={s} value={s}>{s}x</option>)}
          </Select>
        </Row>
        <Row label="HUD anzeigen">
          <Toggle checked={settings.showHud} onChange={(v)=>setSettings({showHud:v})}/>
        </Row>
        <Row label="Timeline anzeigen">
          <Toggle checked={settings.showTimeline} onChange={(v)=>setSettings({showTimeline:v})}/>
        </Row>
        <Row label="Mini-Map anzeigen">
          <Toggle checked={settings.showMinimap} onChange={(v)=>setSettings({showMinimap:v})}/>
        </Row>
      </div>
      <div className="mt-4 text-xs text-zinc-500">
        Gespeichert unter <code>sparkfined.settings.v1</code>. Änderungen wirken sofort.
      </div>

      {/* Data Export / Import */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-zinc-200">Daten — Export / Import</h2>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="mb-2 text-xs text-zinc-400">Wähle Bereiche für Export:</div>
        <div className="mb-3 grid grid-cols-2 gap-2 text-xs text-zinc-300 md:grid-cols-3">
          {Object.keys(KEYS).map(k => {
            const key = k as NamespaceKey;
            return (
              <label key={k} className="inline-flex items-center gap-2">
                <input type="checkbox" checked={!!pick[key]} onChange={()=>setPick(p=>({ ...p, [key]: !p[key] }))}/>
                <span>{k}</span>
              </label>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
            onClick={()=>{
              const selected = Object.entries(pick).filter(([,v])=>v).map(([k])=>k as NamespaceKey);
              const payload = exportAppData(selected);
              downloadJson(`sparkfined-backup-${new Date().toISOString().slice(0,10)}.json`, payload);
            }}
          >Export JSON</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden"
                 onChange={async (e)=>{
                   const f = e.currentTarget.files?.[0]; if (!f) return;
                   setBusy("Import…"); setMsg(null);
                   try {
                     const res = await importAppData(f, "merge");
                     setMsg(`Import erfolgreich: ${res.imported.join(", ")}`);
                   } catch(e:any){ setMsg(`Import-Fehler: ${e?.message||e}`); }
                   setBusy(null); e.currentTarget.value = "";
                 }} />
          <button className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                  onClick={()=>fileRef.current?.click()}>Import JSON (Merge)</button>
        </div>
        {busy && <div className="mt-2 text-[11px] text-zinc-400">{busy}</div>}
        {msg &&  <div className="mt-2 text-[11px] text-emerald-300">{msg}</div>}
      </div>

      {/* Danger Zone */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-zinc-200">Danger Zone</h2>
      <div className="rounded-xl border border-rose-900 bg-rose-950/30 p-4">
        <div className="text-xs text-rose-100">Gezieltes Löschen</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs md:grid-cols-3">
          {Object.entries(KEYS).map(([ns, k])=>(
            <button key={ns}
              className="rounded border border-rose-900 px-2 py-1 text-rose-100 hover:bg-rose-900/20"
              onClick={()=>{ if(confirm(`Lösche ${ns}?`)) { clearNs(ns as NamespaceKey); alert(`${ns} gelöscht.`);} }}>
              Clear {ns}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <button className="rounded border border-rose-900 px-3 py-2 text-sm text-rose-100 hover:bg-rose-900/20"
            onClick={()=>{
              if (!confirm("Factory Reset? Alle sparkfined.* Daten werden gelöscht!")) return;
              Object.keys(KEYS).forEach(ns => clearNs(ns as NamespaceKey));
              alert("Alle App-Daten gelöscht. Bitte Seite neu laden.");
            }}>
            Factory Reset
          </button>
        </div>
      </div>

      {/* Monitoring & Tokens */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-zinc-200">Monitoring & Tokens</h2>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
        <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-3">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flags.enabled} onChange={e=>setFlags({enabled: e.target.checked})}/> Enabled</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flags.includeNetwork} onChange={e=>setFlags({includeNetwork: e.target.checked})}/> API Timings</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flags.includeCanvas} onChange={e=>setFlags({includeCanvas: e.target.checked})}/> Canvas/FPS</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flags.includeUser} onChange={e=>setFlags({includeUser: e.target.checked})}/> User Events</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flags.tokenOverlay} onChange={e=>setFlags({tokenOverlay: e.target.checked})}/> Token-Overlay</label>
          <div className="inline-flex items-center gap-2">
            Sampling
            <input type="number" min={0} max={1} step={0.05} value={flags.sampling} onChange={e=>setFlags({sampling: Number(e.target.value)})}
                   className="w-20 rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5 text-xs text-zinc-200"/>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button className="rounded border border-zinc-700 px-2 py-1 hover:bg-zinc-800" onClick={drain}>Jetzt senden ({buffer.length})</button>
          <span className="text-zinc-500">Batch alle 15s & beim Tab-Wechsel</span>
        </div>
      </div>

      {/* PWA Controls */}
      <h2 className="mt-6 mb-2 text-sm font-semibold text-zinc-200">PWA</h2>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
        <div className="flex flex-wrap items-center gap-2">
          <button className="rounded border border-zinc-700 px-2 py-1 hover:bg-zinc-800"
            onClick={async ()=>{
              setBusy("Update-Check…");
              const res = await pokeServiceWorker();
              setBusy(null);
              setMsg(res==="no-sw" ? "Kein Service Worker gefunden"
                     : res==="message-sent" ? "Update angewiesen (SKIP_WAITING)"
                     : "Update angestoßen");
            }}>
            SW-Update anstoßen
          </button>
          <button className="rounded border border-zinc-700 px-2 py-1 hover:bg-zinc-800"
            onClick={async ()=>{
              setBusy("Caches leeren…");
              const removed = await clearCaches();
              setBusy(null);
              setMsg(`Caches gelöscht: ${removed.length}`);
            }}>
            Caches leeren
          </button>
        </div>
        <div className="mt-2 text-[11px] text-zinc-500">
          Version: {import.meta.env.VITE_APP_VERSION ?? "dev"} · Build: {import.meta.env.MODE} · VAPID pub: {import.meta.env.VITE_VAPID_PUBLIC_KEY ? "set" : "missing"}
        </div>
      </div>
    </div>
  );
}

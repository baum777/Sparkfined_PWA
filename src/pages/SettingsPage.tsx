import React from "react";
import { useSettings, type ThemeMode } from "../state/settings";

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();
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
    </div>
  );
}

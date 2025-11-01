import React from "react";
import { useAlertRules } from "../sections/notifications/useAlertRules";
import RuleEditor from "../sections/notifications/RuleEditor";

export default function NotificationsPage() {
  const { rules, create, update, remove, triggers, clearTriggers, addManualTrigger } = useAlertRules();
  const [draft, setDraft] = React.useState<any>({});
  const btn  = "rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800";

  const askPermission = async () => {
    try { if ("Notification" in window) await Notification.requestPermission(); } catch {}
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-lg font-semibold text-zinc-100">Alert Center</div>
        <div className="flex items-center gap-2">
          <button className={btn} onClick={askPermission}>Browser-Benachrichtigung aktivieren</button>
          <button className={btn} onClick={()=>addManualTrigger(undefined, "Probe")}>Test-Trigger</button>
        </div>
      </div>

      <RuleEditor draft={draft} onChange={setDraft} onSave={()=>{ create(draft); setDraft({}); }} />

      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
        <div className="mb-2 text-sm text-zinc-200">Regeln</div>
        <table className="w-full text-[12px]">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-2 py-1 text-left">Kind</th>
              <th className="px-2 py-1 text-left">Op</th>
              <th className="px-2 py-1 text-left">Value</th>
              <th className="px-2 py-1 text-left">Address</th>
              <th className="px-2 py-1 text-left">TF</th>
              <th className="px-2 py-1 text-left">Enabled</th>
              <th className="px-2 py-1 text-left">Last Trigger</th>
              <th className="px-2 py-1"></th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id} className="border-t border-zinc-800">
                <td className="px-2 py-1">{r.kind}</td>
                <td className="px-2 py-1">{r.op}</td>
                <td className="px-2 py-1">{r.value}</td>
                <td className="px-2 py-1">{r.address?.slice(0,6)}{r.address?"…":""}</td>
                <td className="px-2 py-1">{r.tf}</td>
                <td className="px-2 py-1">
                  <button className="rounded border border-zinc-600 px-2 py-0.5 text-[11px]" onClick={()=>update(r.id, {enabled: !r.enabled})}>{r.enabled?"ON":"OFF"}</button>
                </td>
                <td className="px-2 py-1">{r.lastTriggerAt ? new Date(r.lastTriggerAt).toLocaleString() : "–"}</td>
                <td className="px-2 py-1 text-right">
                  <button className="mr-2 rounded border border-cyan-700 px-2 py-0.5 text-[11px] text-cyan-100 hover:bg-cyan-900/20" onClick={()=>addManualTrigger(r.id, "Probe")}>Probe</button>
                  <button className="rounded border border-rose-900 px-2 py-0.5 text-[11px] text-rose-100 hover:bg-rose-900/20" onClick={()=>remove(r.id)}>Löschen</button>
                </td>
              </tr>
            ))}
            {rules.length===0 && (
              <tr><td className="px-2 py-4 text-center text-zinc-500" colSpan={8}>Keine Regeln – oben erstellen.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm text-zinc-200">Trigger-History</div>
          <button className={btn} onClick={clearTriggers}>Leeren</button>
        </div>
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="px-2 py-1 text-left">Zeit</th>
                <th className="px-2 py-1 text-left">Rule</th>
                <th className="px-2 py-1 text-left">Kind</th>
                <th className="px-2 py-1 text-left">Close</th>
                <th className="px-2 py-1 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {triggers.map(t => (
                <tr key={t.id} className="border-t border-zinc-800">
                  <td className="px-2 py-1">{new Date(t.t).toLocaleString()}</td>
                  <td className="px-2 py-1">{t.ruleId ?? "—"}</td>
                  <td className="px-2 py-1">{t.kind}</td>
                  <td className="px-2 py-1">{t.c ?? "—"}</td>
                  <td className="px-2 py-1">{t.note ?? "—"}</td>
                </tr>
              ))}
              {triggers.length===0 && <tr><td className="px-2 py-4 text-center text-zinc-500" colSpan={5}>Keine Trigger</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useAlertRules } from "../sections/notifications/useAlertRules";
import RuleEditor from "../sections/notifications/RuleEditor";
import { useTelemetry } from "../state/telemetry";
import { subscribePush, unsubscribePush, currentSubscription } from "../lib/push";
import RuleWizard from "../sections/notifications/RuleWizard";
import type { ServerRule } from "../lib/serverRules";
import PlaybookCard from "../sections/ideas/Playbook";

export default function NotificationsPage() {
  const { rules, create, update, remove, triggers, clearTriggers, addManualTrigger } = useAlertRules();
  const { enqueue } = useTelemetry();
  const [draft, setDraft] = React.useState<any>({});
  const [subState, setSubState] = React.useState<"idle"|"on"|"off"|"denied"|"error">("idle");
  const [lastErr, setLastErr] = React.useState<string| null>(null);
  const VAPID = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
  const btn  = "rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800";

  // --- Server Rules Panel (minimal)
  const [srvRules, setSrvRules] = React.useState<ServerRule[]>([]);
  const [ideas, setIdeas] = React.useState<any[]>([]);
  const [address] = React.useState(""); // default address für upload
  const loadSrv = async ()=> {
    const r = await fetch("/api/rules").then((r): any=>r.json()).catch((): any=>null);
    setSrvRules(r?.rules ?? []);
    // Load ideas too
    const iRes = await fetch("/api/ideas").then((r): any=>r.json()).catch((): any=>null);
    setIdeas(iRes?.ideas ?? []);
  };
  const uploadAll = async ()=> {
    for (const r of rules){
      await fetch("/api/rules", {
        method:"POST", headers:{ "content-type":"application/json" },
        body: JSON.stringify({ address: r.address || address || "", tf: r.tf || "15m", rule: r, active: true })
      });
    }
    await loadSrv();
  };
  const toggleAct = async (id:string, active:boolean)=> {
    const curr = srvRules.find(x=>x.id===id); if (!curr) return;
    await fetch("/api/rules", {
      method:"POST", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ ...curr, active })
    });
    await loadSrv();
  };
  const evalNow = async ()=> {
    const r = await fetch("/api/rules/eval-cron").then((r): any=>r.json()).catch((): any=>null);
    alert(r?.ok ? `Eval: groups=${r.groups} evaluated=${r.evaluated} dispatched=${r.dispatched}` : "Eval failed");
  };
  const exportIdeas = async ()=>{
    const blob = await fetch("/api/ideas/export").then(r=>r.blob());
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `ideas-case-studies.md`; a.click();
    URL.revokeObjectURL(url);
  };

  const askPermission = async () => {
    try { 
      if ("Notification" in window) await Notification.requestPermission(); 
    } catch (err) {
      console.error('Failed to request notification permission:', err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 pb-20 md:py-6 md:pb-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-lg font-semibold text-zinc-100">Alert Center</div>
        <div className="flex items-center gap-2">
          <button className={btn} onClick={askPermission}>Browser-Benachrichtigung</button>
          {VAPID ? (
            <>
              <button className={btn} onClick={async()=>{
                setLastErr(null);
                try {
                  const sub = await subscribePush(VAPID);
                  if (sub) {
                    setSubState("on");
                    // persist
                    fetch("/api/push/subscribe", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ subscription: sub, userId: "anon" })});
                  }
                } catch(e:any){
                  setSubState(e?.message==="permission-denied" ? "denied" : "error");
                  setLastErr(String(e?.message ?? e));
                }
              }}>Subscribe Push</button>
              <button className={btn} onClick={async()=>{
                const sub = await currentSubscription();
                if (!sub) { alert("Keine Subscription"); return; }
                await fetch("/api/push/test-send", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ subscription: sub }) });
              }}>Test Push</button>
              <button className={btn} onClick={async()=>{
                const sub = await currentSubscription();
                if (!sub) return;
                await fetch("/api/push/unsubscribe", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
                await unsubscribePush(); setSubState("off");
              }}>Hard Unsubscribe</button>
            </>
          ) : (
            <span className="text-[11px] text-rose-300">VITE_VAPID_PUBLIC_KEY fehlt</span>
          )}
          <button className={btn} onClick={()=>addManualTrigger(Date.now(), { ruleId: "test", address: "test", title: "Test Trigger" })}>Test-Trigger</button>
        </div>
        <div className="text-[11px] text-zinc-400">Push-Status: {subState}</div>
      </div>
      {lastErr && <div className="mb-3 rounded border border-rose-900 bg-rose-950/40 p-2 text-[12px] text-rose-200">Push-Fehler: {lastErr}</div>}

      {/* Preset Wizard */}
      <div className="mb-4">
        <RuleWizard onCreate={(r)=>{ const nr = create(r); enqueue({ id:crypto.randomUUID(), ts:Date.now(), type:"user.rule.create", attrs:{ id:nr.id, kind:nr.kind } } as any); }} />
      </div>

      {/* Server Rules */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm text-zinc-200">Server-Rules (persistiert)</div>
          <div className="flex items-center gap-2">
            <button className={btn} onClick={loadSrv}>Laden</button>
            <button className={btn} onClick={uploadAll}>Alle lokalen Regeln hochladen</button>
            <button className={btn} onClick={evalNow}>Jetzt evaluieren</button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {srvRules.map(r=>(
            <div key={r.id} className="rounded border border-zinc-800 bg-black/30 p-2 text-[12px] text-zinc-200">
              <div className="flex items-center justify-between">
                <div className="font-medium">{r.rule.kind}</div>
                <label className="inline-flex items-center gap-1">
                  <input type="checkbox" checked={r.active} onChange={e=>toggleAct(r.id, e.target.checked)} />
                  aktiv
                </label>
              </div>
              <div className="text-zinc-400">{r.address} · {r.tf}</div>
              <div className="text-zinc-500">id: {r.id.slice(0,8)}… · {new Date(r.updatedAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ideas */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm text-zinc-200">Trade-Ideas</div>
          <div className="flex items-center gap-2">
            <button className={btn} onClick={loadSrv}>Aktualisieren</button>
            <button className={btn} onClick={exportIdeas}>Als Case-Study (MD) exportieren</button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {ideas.map(it=>(
            <div key={it.id} className="rounded border border-zinc-800 bg-black/30 p-2 text-[12px]">
              <div className="flex items-center justify-between">
                <div className="font-medium">{it.title}</div>
                <span className="text-zinc-500">{it.status}</span>
              </div>
              <div className="text-zinc-400">{it.address} · {it.tf} · {it.side}</div>
              <div className="text-zinc-500">Rule: {it.links.ruleId?.slice(0,8) ?? "—"} · Journal: {it.links.journalId?.slice(0,8) ?? "—"}</div>
              {it.risk ? (
                <div className="mt-2 rounded border border-emerald-800/50 bg-emerald-950/20 p-2 text-emerald-200">
                  Stop {it.risk.stopPrice} · Size {it.risk.sizeUnits?.toFixed(2)}u · Risk {it.risk.riskAmount?.toFixed(2)}
                  <div className="text-[11px]">Targets: {(it.risk.rrTargets||[]).map((t: number,i: number)=>`${it.risk!.rrList![i]}R→${t.toFixed(6)}`).join(" · ")}</div>
                </div>
              ) : null}
              <div className="mt-1 flex gap-2">
                <button className={btn} onClick={async()=>{
                  const blob = await fetch(`/api/ideas/export-pack?id=${it.id}`).then((r): any=>r.blob());
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href=url; a.download=`execution-pack-${it.id}.md`; a.click();
                  URL.revokeObjectURL(url);
                }}>Export Pack (MD)</button>
                <button className={btn} onClick={()=>{
                  const chartURL=`${location.origin}/chart?idea=${it.id}`;
                  navigator.clipboard.writeText(chartURL);
                  alert("Chart-Link kopiert!");
                }}>Copy Chart Link</button>
              </div>
              {it.status!=="closed" ? (
                <div className="mt-2 flex items-center gap-2">
                  <button className={btn} onClick={async()=>{
                    const p = Number(prompt("Exit-Preis eingeben:",""));
                    if (!p) return;
                    const r = await fetch("/api/ideas/close",{ method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ id: it.id, exitPrice: p })}).then((r): any=>r.json()).catch((): any=>null);
                    alert(r?.ok ? "Idea geschlossen" : "Fehler beim Schließen");
                    await loadSrv();
                  }}>Schließen</button>
                  <button className={btn} onClick={async()=>{
                    const note = prompt("Kurze Outcome-Notiz:","") || "";
                    await fetch("/api/ideas",{ method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ id: it.id, outcome:{ note } })});
                    await loadSrv();
                  }}>Outcome-Notiz</button>
                </div>
              ) : (
                <div className="mt-2 text-emerald-300">
                  Exit: {it.outcome?.exitPrice ?? "—"} · P/L: {typeof it.outcome?.pnlPct==="number" ? `${it.outcome!.pnlPct!.toFixed(2)}%` : "n/a"}
                </div>
              )}
              {/* Inline apply Playbook to existing idea (uses lastClose/ATR from current Dashboard metrics not wired here) */}
              <div className="mt-3">
                <PlaybookCard
                  entry={undefined /* set from detail drawer when available */}
                  atr={undefined   /* set from detail drawer when available */}
                  onApply={async (res)=>{
                    const payload = {
                      id: it.id,
                      risk: {
                        balance: res.balance, riskPct: res.pb.riskPct, atrMult: res.pb.atrMult,
                        entryPrice: (res.rrTargets[0] ?? 0) - (res.rrList[0] ?? 0)*((res.rrTargets[0] ?? 0)- ((res.rrTargets[0] ?? 0)- ((res.rrList[0] ?? 0)*((res.rrTargets[0] ?? 0)-0)))), /* placeholder */
                        stopPrice: res.stopPrice, sizeUnits: res.sizeUnits, riskAmount: res.riskAmount,
                        rrTargets: res.rrTargets, rrList: res.rrList, kellyLitePct: res.kellyLitePct
                      },
                      targets: res.rrTargets
                    };
                    await fetch("/api/ideas", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(payload) });
                    await loadSrv();
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <RuleEditor draft={draft} onChange={setDraft} onSave={()=>{ const r = create(draft); enqueue({ id: crypto.randomUUID(), ts: Date.now(), type: "user.rule.create", attrs: { id: r.id, kind: r.kind } } as any); setDraft({}); }} />

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
                  <button className="mr-2 rounded border border-cyan-700 px-2 py-0.5 text-[11px] text-cyan-100 hover:bg-cyan-900/20" onClick={()=>addManualTrigger(Date.now(), { ruleId: r.id, address: r.address || "test", tf: r.tf, title: `Alert: ${r.kind}`, body: `Test probe for ${r.kind}` })}>Probe</button>
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

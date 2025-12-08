import React from "react";
import { useAlertRules } from "../sections/notifications/useAlertRules";
import RuleEditor from "../sections/notifications/RuleEditor";
import { useTelemetry } from "../state/telemetry";
import { subscribePush, unsubscribePush, currentSubscription } from "../lib/push";
import RuleWizard from "../sections/notifications/RuleWizard";
import type { ServerRule } from "../lib/serverRules";
import PlaybookCard from "../sections/ideas/Playbook";
import { usePushQueueStore } from "../store/pushQueueStore";
import {
  createIdeaPacket,
  getAllIdeaPackets,
  migrateIdeaPacketsFromLocalStorage,
  removeIdeaPacket,
  replaceIdeaPackets,
  updateIdeaPacket,
} from "../lib/ideaPackets";
import type { IdeaConfidence, IdeaPacket, IdeaTimeframe } from "@/types/ideas";

export default function NotificationsPage() {
  const { rules, create, update, remove, triggers, clearTriggers, addManualTrigger } = useAlertRules();
  const { enqueue } = useTelemetry();
  const [draft, setDraft] = React.useState<any>({});
  const [subState, setSubState] = React.useState<"idle"|"on"|"off"|"denied"|"error">("idle");
  const [lastErr, setLastErr] = React.useState<string| null>(null);
  const VAPID = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
  const btn  = "rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800";
  const { attempts, lastStatus, lastReason } = usePushQueueStore();
  const queuedCount = React.useMemo(() => attempts.filter(a => a.status === "queued").length, [attempts]);

  // --- Server Rules Panel (minimal)
  const [srvRules, setSrvRules] = React.useState<ServerRule[]>([]);
  const [ideas, setIdeas] = React.useState<IdeaPacket[]>([]);
  const [ideaForm, setIdeaForm] = React.useState<{
    editId: string | null;
    title: string;
    thesis: string;
    timeframe: IdeaTimeframe;
    confidence: IdeaConfidence;
  }>({
    editId: null,
    title: "",
    thesis: "",
    timeframe: "swing",
    confidence: "medium",
  });
  const [address] = React.useState(""); // default address für upload

  React.useEffect(() => {
    let cancelled = false;

    const hydrateIdeas = async () => {
      await migrateIdeaPacketsFromLocalStorage();
      const allIdeas = await getAllIdeaPackets();
      if (!cancelled) {
        setIdeas(allIdeas);
      }
    };

    void hydrateIdeas();

    return () => {
      cancelled = true;
    };
  }, []);

  const upsertIdea = React.useCallback(async () => {
    const title = ideaForm.title.trim();
    const thesis = ideaForm.thesis.trim();
    if (!title || !thesis) {
      alert("Titel und Thesis sind Pflichtfelder.");
      return;
    }

    const now = Date.now();
    if (ideaForm.editId) {
      const updated = await updateIdeaPacket(ideaForm.editId, {
        title,
        thesis,
        timeframe: ideaForm.timeframe,
        confidence: ideaForm.confidence,
        updatedAt: now,
      });
      if (updated) {
        setIdeas((prev) => prev.map((idea) => (idea.id === updated.id ? updated : idea)));
      }
    } else {
      const created = await createIdeaPacket({
        title,
        thesis,
        timeframe: ideaForm.timeframe,
        confidence: ideaForm.confidence,
      });
      setIdeas((prev) => [created, ...prev]);
    }

    setIdeaForm((prev) => ({ ...prev, editId: null, title: "", thesis: "" }));
  }, [ideaForm.confidence, ideaForm.editId, ideaForm.thesis, ideaForm.timeframe, ideaForm.title]);

  const startEdit = React.useCallback((packet: IdeaPacket) => {
    setIdeaForm({
      editId: packet.id,
      title: packet.title,
      thesis: packet.thesis,
      timeframe: packet.timeframe,
      confidence: packet.confidence,
    });
  }, []);
  const archiveIdea = React.useCallback(async (id: string) => {
    await removeIdeaPacket(id);
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
  }, []);
  const loadSrv = async ()=> {
    const r = await fetch("/api/rules").then((r): any=>r.json()).catch((): any=>null);
    setSrvRules(r?.rules ?? []);
    // Load ideas too
    const iRes = await fetch("/api/ideas").then((r): any=>r.json()).catch((): any=>null);
    if (iRes?.ideas) {
      const mapped = (iRes.ideas as any[]).map((it) => ({
        id: it.id ?? crypto.randomUUID(),
        title: it.title ?? "Untitled idea",
        thesis: it.thesis ?? "",
        timeframe: it.tf ?? it.timeframe ?? "swing",
        confidence: it.confidence ?? "medium",
        updatedAt: it.updatedAt ?? Date.now(),
      }));
      const syncedIdeas = await replaceIdeaPackets(mapped);
      setIdeas(syncedIdeas);
    }
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
          <button className={btn} data-testid="notification-permission-button" onClick={askPermission}>Browser-Benachrichtigung</button>
          {VAPID ? (
            <>
              <button
                className={btn}
                data-testid="subscribe-push-button"
                onClick={async()=>{
                  setLastErr(null);
                  try {
                    const res = await subscribePush(VAPID);
                    if (res.status === "queued" && res.subscription) {
                      setSubState("on");
                      fetch("/api/push/subscribe", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ subscription: res.subscription, userId: "anon" })});
                    } else if (res.status === "denied") {
                      setSubState("denied");
                    } else if (res.reason) {
                      setSubState("error");
                      setLastErr(res.reason);
                    }
                  } catch(e:any){
                    setSubState("error");
                    setLastErr(String(e?.message ?? e));
                  }
                }}>Subscribe Push</button>
              <button className={btn} data-testid="test-push-button" onClick={async()=>{
                const sub = await currentSubscription();
                if (!sub) { alert("Keine Subscription"); return; }
                await fetch("/api/push/test-send", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ subscription: sub }) });
              }}>Test Push</button>
              <button className={btn} data-testid="unsubscribe-push-button" onClick={async()=>{
                const sub = await currentSubscription();
                if (!sub) return;
                await fetch("/api/push/unsubscribe", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
                await unsubscribePush(); setSubState("off");
              }}>Hard Unsubscribe</button>
            </>
          ) : (
            <span className="text-[11px] text-rose-300">VITE_VAPID_PUBLIC_KEY fehlt</span>
          )}
          <button
            className={btn}
            data-testid="manual-push-trigger"
            onClick={()=>addManualTrigger(Date.now(), { ruleId: "test", address: "test", title: "Test Trigger", body: "manual" })}
          >
            Test-Trigger
          </button>
        </div>
        <div className="text-[11px] text-zinc-400" data-testid="push-status">Push-Status: {subState}</div>
      </div>
      <div className="mb-3 flex items-center justify-between rounded border border-zinc-800 bg-black/30 p-2 text-[12px] text-zinc-200" data-testid="push-queue-panel">
        <div>Queued Pushes: <span data-testid="push-queue-count">{queuedCount}</span></div>
        <div className="text-zinc-400" data-testid="push-last-status">Letzter Status: {lastStatus || "idle"}{lastReason ? ` (${lastReason})` : ""}</div>
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
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3" data-testid="idea-packets-section">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm text-zinc-200">Trade-Ideas</div>
          <div className="flex items-center gap-2">
            <button className={btn} onClick={loadSrv}>Aktualisieren</button>
            <button className={btn} onClick={exportIdeas}>Als Case-Study (MD) exportieren</button>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded border border-zinc-800 bg-black/30 p-3 text-[12px]" data-testid="idea-packet-form">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-medium text-zinc-100">{ideaForm.editId ? "Idea aktualisieren" : "Neues Idea Packet"}</div>
              {ideaForm.editId ? (
                <button className={btn} onClick={()=>setIdeaForm((prev)=>({ ...prev, editId: null, title: "", thesis: "" }))}>
                  Reset
                </button>
              ) : null}
            </div>
            <label className="mb-2 block text-zinc-300">Titel
              <input
                className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100"
                value={ideaForm.title}
                onChange={(e)=>setIdeaForm((prev)=>({ ...prev, title: e.target.value }))}
                data-testid="idea-title-input"
              />
            </label>
            <label className="mb-2 block text-zinc-300">Thesis
              <textarea
                className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100"
                value={ideaForm.thesis}
                onChange={(e)=>setIdeaForm((prev)=>({ ...prev, thesis: e.target.value }))}
                data-testid="idea-thesis-input"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-zinc-300">Timeframe
                <select
                  className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100"
                  value={ideaForm.timeframe}
                  onChange={(e)=>setIdeaForm((prev)=>({ ...prev, timeframe: e.target.value as IdeaTimeframe }))}
                  data-testid="idea-timeframe-select"
                >
                  <option value="scalp">Scalp</option>
                  <option value="intraday">Intraday</option>
                  <option value="swing">Swing</option>
                  <option value="position">Position</option>
                </select>
              </label>
              <label className="block text-zinc-300">Confidence
                <select
                  className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100"
                  value={ideaForm.confidence}
                  onChange={(e)=>setIdeaForm((prev)=>({ ...prev, confidence: e.target.value as IdeaConfidence }))}
                  data-testid="idea-confidence-select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
            <div className="mt-3 flex justify-end">
              <button className={btn} onClick={upsertIdea} data-testid="idea-save-button">
                {ideaForm.editId ? "Änderungen speichern" : "Idea Packet sichern"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2" data-testid="idea-packet-list">
            {ideas.map(it=>(
              <div
                key={it.id}
                className="rounded border border-zinc-800 bg-black/30 p-2 text-[12px]"
                data-testid={`idea-packet-${it.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{it.title}</div>
                  <span className="text-zinc-500">{it.timeframe}</span>
                </div>
                <div className="text-zinc-400">{it.thesis}</div>
                <div className="text-zinc-500">Confidence: {it.confidence} · Updated {new Date(it.updatedAt).toLocaleString()}</div>
                <div className="mt-2 flex items-center gap-2">
                  <button className={btn} onClick={()=>startEdit(it)} data-testid="idea-edit-button">Bearbeiten</button>
                  <button className={btn} onClick={()=>{ void archiveIdea(it.id); }}>Archivieren</button>
                </div>
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
            {ideas.length === 0 ? (
              <div className="rounded border border-zinc-800 bg-black/20 p-3 text-zinc-400" data-testid="idea-empty-state">
                Noch keine Ideas gespeichert. Füge ein Packet hinzu, um es hier zu sehen.
              </div>
            ) : null}
          </div>
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

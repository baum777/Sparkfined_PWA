import React from "react";
import { useJournal } from "../sections/journal/useJournal";
import JournalEditor from "../sections/journal/JournalEditor";
import JournalList from "../sections/journal/JournalList";
import { JournalStats } from "../sections/journal/JournalStats";
import type { JournalNote } from "../lib/journal";
import { useAssist } from "../sections/ai/useAssist";

export default function JournalPage() {
  const { notes, create, update, remove } = useJournal();
  const [draft, setDraft] = React.useState<Partial<JournalNote>>({});
  const [search, setSearch] = React.useState("");
  const [tag, setTag] = React.useState("");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const current = openId ? notes.find(n => n.id === openId) : null;
  const [serverNotes, setServerNotes] = React.useState<JournalNote[]>([]);

  const btn = "rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800";
  const { loading: aiLoading, result: aiResult, run: runAssist } = useAssist();

  React.useEffect(() => {
    const onIns = (e:any) => {
      const t = e?.detail?.text as string;
      if (!t) return;
      setDraft(d => ({ ...d, body: (d.body ? (d.body + "\n\n") : "") + t }));
    };
    window.addEventListener("journal:insert" as any, onIns as any);
    return () => window.removeEventListener("journal:insert" as any, onIns as any);
  }, []);

    const runAIOnDraft = () => {
      const sys = "Du reduzierst Chart-Notizen auf das Wesentliche (deutsch). Schreibe 4–6 kurze Spiegelstriche: Kontext, Beobachtung, Hypothese, Plan, Risiko, Nächste Aktion.";
      const ctx = [
        draft.title ? `Titel: ${draft.title}` : "",
        draft.address ? `CA: ${draft.address}` : "",
        draft.tf ? `TF: ${draft.tf}` : "",
        draft.body ? `Notiz:\n${draft.body}` : "",
      ].filter(Boolean).join("\n");
      if (!ctx) return;
      runAssist(sys, ctx);
    };
    const insertAI = () => {
      if (!aiResult?.text) return;
      setDraft(d => ({ ...d, body: (d.body ? (d.body + "\n\n") : "") + aiResult.text }));
    };

    const saveServer = async (note?: Partial<JournalNote>) => {
      const pick = <T,>(primary: T | undefined, fallback: T | undefined) =>
        primary !== undefined ? primary : fallback;

      const payload: Partial<JournalNote> & { id?: string } = {
        id: note?.id || draft.id || undefined,
        title: pick(note?.title, draft.title) ?? "",
        body: pick(note?.body, draft.body) ?? "",
        address: pick(note?.address, draft.address),
        tf: pick(note?.tf, draft.tf),
        ruleId: pick(note?.ruleId, draft.ruleId),
        tags: pick(note?.tags, draft.tags) ?? [],
        setupName: pick(note?.setupName, draft.setupName),
        status: pick(note?.status, draft.status),
        entryPrice: pick(note?.entryPrice, draft.entryPrice),
        exitPrice: pick(note?.exitPrice, draft.exitPrice),
        positionSize: pick(note?.positionSize, draft.positionSize),
        stopLoss: pick(note?.stopLoss, draft.stopLoss),
        takeProfit: pick(note?.takeProfit, draft.takeProfit),
        pnl: pick(note?.pnl, draft.pnl),
        pnlPercent: pick(note?.pnlPercent, draft.pnlPercent),
        riskRewardRatio: pick(note?.riskRewardRatio, draft.riskRewardRatio),
        screenshotDataUrl: pick(note?.screenshotDataUrl, draft.screenshotDataUrl),
        permalink: pick(note?.permalink, draft.permalink),
        aiAttachedAt: pick(note?.aiAttachedAt, draft.aiAttachedAt),
      };
      const res = await fetch("/api/journal", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(payload) }).then((r): any=>r.json()).catch((): any=>null);
      if (res?.ok) { setDraft(res.note); await loadServer(); }
    };
  const loadServer = async ()=> {
    const res = await fetch("/api/journal").then((r): any=>r.json()).catch((): any=>null);
    setServerNotes(res?.notes ?? []);
  };
  const delServer = async (id:string)=> {
    if (!confirm("Diese Notiz l\u00f6schen?")) return;
    const res = await fetch("/api/journal", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ delete:true, id }) }).then((r): any=>r.json()).catch((): any=>null);
    if (res?.ok) await loadServer();
  };
  const attachAI = async () => {
    if (!aiResult?.text) return;
    const merged = (draft.body ? (draft.body + "\n\n") : "") + aiResult.text;
    await saveServer({ body: merged, aiAttachedAt: Date.now() } as any);
  };

  const onSave = async () => {
    if (openId && current) {
      await update(openId, { ...current, ...draft });
      setOpenId(null); setDraft({});
    } else {
      const n = await create(draft);
      setOpenId(null); setDraft({});
      // optional: scroll to created note
      setTimeout(()=>{ document.getElementById(`note-${n.id}`)?.scrollIntoView({behavior:"smooth"}); }, 50);
    }
  };

  // accept incoming quick-drafts from Chart ("journal:draft" events)
  React.useEffect(() => {
    const onDraft = (e: Event) => {
      const any = e as CustomEvent;
      const d = any.detail || {};
      setDraft((prev)=>({ ...prev, ...d, title: prev.title || "Chart Snapshot" }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("journal:draft" as any, onDraft as any);
    return () => window.removeEventListener("journal:draft" as any, onDraft as any);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 pb-20 md:py-6 md:pb-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-lg font-semibold text-zinc-100">Journal</div>
        <div className="flex items-center gap-2">
          <input
            placeholder="Suche…"
            value={search}
            onChange={e=>setSearch(e.target.value)}
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
          />
          <input
            placeholder="#tag"
            value={tag}
            onChange={e=>setTag(e.target.value)}
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
          />
          <button className={btn} onClick={()=>{ setDraft({}); setOpenId(null); }}>Neu</button>
        </div>
      </div>

        <JournalEditor draft={draft} onChange={(d: any)=>setDraft(d)} onSave={()=>saveServer()} />
        <div className="mt-4">
          <JournalStats notes={notes} />
        </div>
      <div className="mt-3 rounded-xl border border-emerald-900 bg-emerald-950/20 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm text-emerald-200">AI-Assist: Notiz straffen</div>
          <button className={btn} onClick={runAIOnDraft} disabled={aiLoading}>{aiLoading?"Verdichte…":"Verdichten"}</button>
        </div>
        {aiResult?.text
          ? <pre className="whitespace-pre-wrap rounded border border-emerald-800/60 bg-black/30 p-3 text-[12px] text-emerald-100">{aiResult.text}</pre>
          : <div className="text-[12px] text-emerald-300/70">Lass dir prägnante Bullet-Notizen aus deinem Entwurf vorschlagen.</div>
        }
        <div className="mt-2 flex items-center gap-2">
          <button className={btn} onClick={attachAI} disabled={!aiResult?.text}>AI-Analyse an Notiz anhängen & speichern</button>
          <button className={btn} onClick={loadServer}>Server-Notizen laden</button>
          <button className={btn} onClick={async()=>{
            const fmt = prompt("Exportformat: json oder md", "json") || "json";
            const blob = await fetch(`/api/journal/export?fmt=${encodeURIComponent(fmt)}`).then(r=>r.blob());
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `journal-export.${fmt==="md"?"md":"json"}`; a.click();
            URL.revokeObjectURL(url);
          }}>Exportieren</button>
        </div>
      </div>

      {/* Server-Note List */}
      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
        <div className="mb-2 text-sm text-zinc-200">Server-Notizen</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {serverNotes.map(n=>(
            <div key={n.id} className="rounded border border-zinc-800 bg-black/30 p-2 text-[12px] text-zinc-200">
              <div className="flex items-center justify-between">
                <div className="font-medium">{n.title || "(ohne Titel)"}</div>
                <div className="text-zinc-500">{new Date(n.updatedAt||n.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-zinc-400">{n.address||""} {n.tf?`· ${n.tf}`:""} {n.ruleId?`· rule:${n.ruleId.slice(0,8)}…`:""}</div>
              <div className="mt-1 line-clamp-4 whitespace-pre-wrap text-zinc-300">{n.body}</div>
              <div className="mt-2 flex items-center gap-2">
                <button className={btn} onClick={()=>setDraft(n)}>In Editor laden</button>
                <button className={btn} onClick={()=>delServer(n.id)}>Löschen</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <JournalList
          entries={notes}
          onOpen={(id)=>{ const n = notes.find(x=>x.id===id); if (!n) return; setOpenId(id); setDraft(n as any); }}
          onDelete={remove}
          filter={{ q: search, tag }}
        />
      </div>
    </div>
  );
}

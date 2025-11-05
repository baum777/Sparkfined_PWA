import React from "react";
import { useJournal } from "../sections/journal/useJournal";
import JournalEditor from "../sections/journal/JournalEditor";
import JournalList from "../sections/journal/JournalList";
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
    const payload = {
      id: note?.id || draft.id || undefined,
      title: note?.title ?? draft.title ?? "",
      body: note?.body ?? draft.body ?? "",
      address: note?.address ?? draft.address ?? "",
      tf: note?.tf ?? draft.tf ?? undefined,
      ruleId: note?.ruleId ?? draft.ruleId ?? undefined,
      tags: note?.tags ?? draft.tags ?? []
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

  const onSave = () => {
    if (openId && current) {
      update(openId, { ...current, ...draft });
      setOpenId(null); setDraft({});
    } else {
      const n = create(draft);
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
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-8">
      {/* Page Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-zinc-100">Journal</h1>
        <p className="text-sm text-zinc-400">Track your trades, insights, and reflections</p>
      </header>

      {/* Search & Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex-1 min-w-[200px]">
          <span className="sr-only">Search notes</span>
          <input
            placeholder="Search notes..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500"
          />
        </label>
        <label className="flex-1 min-w-[120px]">
          <span className="sr-only">Filter by tag</span>
          <input
            placeholder="#tag"
            value={tag}
            onChange={e=>setTag(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500"
          />
        </label>
        <button 
          onClick={()=>{ setDraft({}); setOpenId(null); }}
          className="rounded-lg border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          + New Note
        </button>
      </div>

      {/* Draft Editor Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-200">Draft</h2>
        <JournalEditor draft={draft} onChange={(d: any)=>setDraft(d)} onSave={()=>saveServer()} />
      </section>

      {/* AI-Assist Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-200">AI-Assist</h2>
            <p className="text-sm text-zinc-400">Condense your notes into actionable bullet points</p>
          </div>
          <button 
            onClick={runAIOnDraft} 
            disabled={aiLoading}
            className="rounded-lg border border-emerald-700 bg-emerald-900/30 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-900/50 disabled:opacity-50 transition-colors"
          >
            {aiLoading ? "Processing..." : "Condense"}
          </button>
        </div>

        <div className="rounded-xl border border-emerald-900 bg-emerald-950/20 p-4">
          {aiResult?.text ? (
            <div className="space-y-3">
              <pre className="whitespace-pre-wrap rounded-lg border border-emerald-800/60 bg-black/30 p-4 text-sm text-emerald-100 leading-relaxed">
                {aiResult.text}
              </pre>
              {aiResult && (
                <div className="text-xs text-zinc-500">
                  {aiResult.provider} · {aiResult.model} · {aiResult.ms}ms
                  {aiResult.costUsd != null && ` · ~$${aiResult.costUsd.toFixed(4)}`}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-emerald-300/70">
              Generate concise bullet points from your draft notes
            </p>
          )}

          {/* Advanced Actions (Collapsed) */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-300 select-none">
              Advanced Actions
            </summary>
            <div className="mt-3 flex flex-wrap gap-2">
              <button 
                onClick={attachAI} 
                disabled={!aiResult?.text}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                Attach AI & Save
              </button>
              <button 
                onClick={loadServer}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                Load Server Notes
              </button>
              <button 
                onClick={async()=>{
                  const fmt = prompt("Export format: json or md", "json") || "json";
                  const blob = await fetch(`/api/journal/export?fmt=${encodeURIComponent(fmt)}`).then(r=>r.blob());
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); 
                  a.href = url; 
                  a.download = `journal-export.${fmt==="md"?"md":"json"}`; 
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                Export (JSON/MD)
              </button>
            </div>
          </details>
        </div>
      </section>

      {/* Server Notes Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-200">
              Saved Notes
              <span className="ml-2 inline-block rounded px-2 py-0.5 text-xs font-medium bg-cyan-950/30 text-cyan-400 border border-cyan-800/30">
                Server
              </span>
            </h2>
            <p className="text-sm text-zinc-400">Synced and persistent across devices</p>
          </div>
          <button 
            onClick={loadServer}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          {serverNotes.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="text-4xl text-zinc-700">📝</div>
              <p className="text-sm text-zinc-400">No server notes yet</p>
              <p className="text-xs text-zinc-500">Save your draft to create a synced note</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {serverNotes.map(n=>(
                <div key={n.id} className="rounded-lg border border-zinc-800 bg-black/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm text-zinc-200">{n.title || "(Untitled)"}</div>
                    <div className="text-xs text-zinc-500">{new Date(n.updatedAt||n.createdAt).toLocaleDateString()}</div>
                  </div>
                  {(n.address || n.tf || n.ruleId) && (
                    <div className="text-xs text-zinc-400">
                      {n.address?.slice(0,8)}… {n.tf && `· ${n.tf}`} {n.ruleId && `· rule`}
                    </div>
                  )}
                  <div className="text-sm text-zinc-300 line-clamp-3 whitespace-pre-wrap leading-relaxed">
                    {n.body}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button 
                      onClick={()=>setDraft(n)}
                      className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      Load to Editor
                    </button>
                    <button 
                      onClick={()=>delServer(n.id)}
                      className="rounded border border-rose-800 px-2 py-1 text-xs text-rose-200 hover:bg-rose-900/30 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Local Notes Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-200">
            Local Notes
            <span className="ml-2 inline-block rounded px-2 py-0.5 text-xs font-medium bg-amber-950/30 text-amber-400 border border-amber-800/30">
              Browser
            </span>
          </h2>
          <p className="text-sm text-zinc-400">Stored in your browser (localStorage)</p>
        </div>

        {notes.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-12 text-center space-y-3">
            <div className="text-4xl text-zinc-700">📋</div>
            <p className="text-sm text-zinc-400">No local notes</p>
            <p className="text-xs text-zinc-500">Create a new note above to get started</p>
          </div>
        ) : (
          <JournalList
            notes={notes}
            onOpen={(id)=>{ const n = notes.find(x=>x.id===id); if (!n) return; setOpenId(id); setDraft(n as any); }}
            onDelete={remove}
            filter={{ q: search, tag }}
          />
        )}
      </section>
    </div>
  );
}

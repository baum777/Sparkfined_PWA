import React from "react";
import { useJournal } from "../sections/journal/useJournal";
import JournalEditor from "../sections/journal/JournalEditor";
import JournalList from "../sections/journal/JournalList";
import type { JournalNote } from "../sections/journal/types";

export default function JournalPage() {
  const { notes, create, update, remove } = useJournal();
  const [draft, setDraft] = React.useState<Partial<JournalNote>>({});
  const [search, setSearch] = React.useState("");
  const [tag, setTag] = React.useState("");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const current = openId ? notes.find(n => n.id === openId) : null;

  const btn = "rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800";

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
    <div className="mx-auto max-w-6xl px-4 py-6">
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

      <JournalEditor draft={draft} onChange={setDraft} onSave={onSave} />

      <div className="mt-4">
        <JournalList
          notes={notes}
          onOpen={(id)=>{ const n = notes.find(x=>x.id===id); if (!n) return; setOpenId(id); setDraft(n); }}
          onDelete={remove}
          filter={{ q: search, tag }}
        />
      </div>
    </div>
  );
}

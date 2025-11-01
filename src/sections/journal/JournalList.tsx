import React from "react";
import type { JournalNote } from "./types";

export default function JournalList({
  notes, onOpen, onDelete, filter
}: {
  notes: JournalNote[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  filter?: { tag?: string; q?: string };
}) {
  const q = filter?.q?.toLowerCase().trim();
  const t = filter?.tag?.toLowerCase().trim();
  const items = notes.filter(n => {
    const okQ = !q || [n.title, n.body, n.tags.join(" ")].some(s => s?.toLowerCase().includes(q));
    const okT = !t || n.tags.map(x=>x.toLowerCase()).includes(t);
    return okQ && okT;
  });
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {items.map(n => (
        <div key={n.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
          <div className="mb-1 flex items-center justify-between">
            <div className="truncate text-sm text-zinc-100">{n.title}</div>
            <div className="text-[10px] text-zinc-500">{new Date(n.updatedAt).toLocaleString()}</div>
          </div>
          {n.screenshotDataUrl && <img src={n.screenshotDataUrl} alt="" className="mb-2 h-28 w-full rounded object-cover" />}
          <div className="line-clamp-3 text-[12px] text-zinc-300">{n.body}</div>
          <div className="mt-2 flex flex-wrap gap-1">
            {n.tags.map(tag => <span key={tag} className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">#{tag}</span>)}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <button className="rounded border border-cyan-700 px-2 py-1 text-[11px] text-cyan-100 hover:bg-cyan-900/20" onClick={()=>onOpen(n.id)}>Öffnen</button>
            <button className="rounded border border-rose-900 px-2 py-1 text-[11px] text-rose-100 hover:bg-rose-900/20" onClick={()=>onDelete(n.id)}>Löschen</button>
          </div>
        </div>
      ))}
      {items.length === 0 && <div className="col-span-full rounded border border-zinc-800 p-6 text-center text-sm text-zinc-400">Keine Einträge</div>}
    </div>
  );
}

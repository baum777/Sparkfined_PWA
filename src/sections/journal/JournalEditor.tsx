import React from "react";
import type { JournalNote } from "./types";

export default function JournalEditor({
  draft, onChange, onSave
}: {
  draft: Partial<JournalNote>;
  onChange: (next: Partial<JournalNote>) => void;
  onSave: () => void;
}) {
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const btn = "rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800";

  const onPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith("image/"));
    if (!item) return;
    const blob = item.getAsFile(); if (!blob) return;
    const dataUrl = await blobToDataUrl(blob);
    onChange({ ...draft, screenshotDataUrl: dataUrl });
  };

  const onPickFile = async (f?: File) => {
    if (!f) return;
    const dataUrl = await blobToDataUrl(f);
    onChange({ ...draft, screenshotDataUrl: dataUrl });
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="grid gap-2 md:grid-cols-3">
        <div className="md:col-span-2">
          <input
            value={draft.title || ""}
            onChange={e => onChange({ ...draft, title: e.target.value })}
            placeholder="Titel"
            className="mb-2 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-200"
          />
          <textarea
            value={draft.body || ""}
            onChange={e => onChange({ ...draft, body: e.target.value })}
            onPaste={onPaste}
            placeholder="Notiz (Markdown möglich). Bild direkt einfügen (Paste) oder Datei wählen."
            rows={8}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-zinc-200"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              value={(draft.tags || []).join(", ")}
              onChange={e => onChange({ ...draft, tags: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) })}
              placeholder="Tags (comma,separated)"
              className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
            />
            <button className={btn} onClick={() => fileRef.current?.click()}>Bild wählen</button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.currentTarget.files?.[0]; onPickFile(f || undefined); e.currentTarget.value = ""; }}
            />
            <button className={btn} onClick={onSave}>Speichern</button>
            {draft.permalink && <a className={btn} href={draft.permalink} target="_blank" rel="noreferrer">Permalink öffnen</a>}
          </div>
        </div>
        <div>
          <div className="text-xs text-zinc-400">Vorschau</div>
          <div className="mt-1 rounded border border-zinc-800 bg-black/30 p-2">
            {draft.screenshotDataUrl
              ? <img src={draft.screenshotDataUrl} alt="screenshot" className="max-h-48 w-full rounded object-contain" />
              : <div className="text-[11px] text-zinc-500">Kein Bild</div>}
          </div>
          {draft.address && <div className="mt-2 text-[11px] text-zinc-500">CA: {draft.address}</div>}
          {draft.tf && <div className="text-[11px] text-zinc-500">TF: {draft.tf}</div>}
        </div>
      </div>
    </div>
  );
}

async function blobToDataUrl(b: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(b);
  });
}

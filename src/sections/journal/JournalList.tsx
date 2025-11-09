import React from "react";
import { TRADE_STATUS_META, computeTradeMetrics } from "./types";
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
        <JournalNoteCard
          key={n.id}
          note={n}
          onOpen={onOpen}
          onDelete={onDelete}
        />
      ))}
      {items.length === 0 && <div className="col-span-full rounded border border-zinc-800 p-6 text-center text-sm text-zinc-400">Keine Einträge</div>}
    </div>
  );
}

type CardProps = {
  note: JournalNote;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
};

function JournalNoteCard({ note, onOpen, onDelete }: CardProps) {
  const { status, setupName, entryPrice, exitPrice, positionSize, stopLoss, takeProfit } = note;
  const metrics = computeTradeMetrics({ entryPrice, exitPrice, positionSize, stopLoss, takeProfit });
  const pnlValue = metrics.pnl ?? note.pnl;
  const pnlPercent = metrics.pnlPercent ?? note.pnlPercent;
  const rrValue = metrics.riskRewardRatio ?? note.riskRewardRatio;

  const statusMeta = status ? TRADE_STATUS_META[status] : undefined;
  const pnlTone =
    typeof pnlValue === "number"
      ? pnlValue > 0
        ? "text-emerald-300"
        : pnlValue < 0
          ? "text-rose-300"
          : "text-zinc-300"
      : "text-zinc-400";

  const statusClass = statusMeta
    ? statusMeta.tone === "positive"
      ? "border-emerald-700/60 bg-emerald-500/10 text-emerald-200"
      : statusMeta.tone === "negative"
        ? "border-rose-800/60 bg-rose-500/10 text-rose-200"
        : statusMeta.tone === "info"
          ? "border-sky-700/60 bg-sky-500/10 text-sky-200"
          : "border-zinc-700/60 bg-zinc-500/10 text-zinc-200"
    : "border-zinc-700/60 bg-zinc-800/40 text-zinc-300";

  const rrBadge =
    typeof rrValue === "number"
      ? rrValue >= 2
        ? "border-emerald-700/60 bg-emerald-500/10 text-emerald-200"
        : rrValue >= 1
          ? "border-amber-700/60 bg-amber-500/10 text-amber-200"
          : "border-rose-800/60 bg-rose-500/10 text-rose-200"
      : "border-zinc-700/60 bg-zinc-800/40 text-zinc-300";

  return (
    <article
      id={`note-${note.id}`}
      className="flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 p-3"
      aria-label={`Journal Note ${note.title || note.id}`}
    >
      <header className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="truncate text-sm font-medium text-zinc-100">{note.title || "(ohne Titel)"}</div>
          <div className="text-[10px] text-zinc-500">{new Date(note.updatedAt || note.createdAt).toLocaleString()}</div>
        </div>
        {statusMeta && (
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusClass}`}>
            <span aria-hidden>{statusMeta.emoji}</span>
            <span>{statusMeta.label}</span>
          </span>
        )}
      </header>

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
        {setupName && (
          <span className="rounded border border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-300">
            Setup: {setupName}
          </span>
        )}
        {typeof rrValue === "number" && (
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${rrBadge}`}>
            R/R <span>{rrValue.toFixed(2)}</span>
          </span>
        )}
        {typeof pnlPercent === "number" && (
          <span className="rounded border border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-300">
            {pnlPercent >= 0 ? "+" : ""}
            {pnlPercent.toFixed(2)}%
          </span>
        )}
      </div>

      {note.screenshotDataUrl && <img src={note.screenshotDataUrl} alt="" className="mt-3 h-28 w-full rounded object-cover" />}

      <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-zinc-300">
        {note.body}
      </p>

      <div className="mt-2 flex flex-wrap gap-1">
        {note.tags.map(tag => (
          <span key={tag} className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">
            #{tag}
          </span>
        ))}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-zinc-500">PnL</dt>
          <dd className={`mt-0.5 text-sm font-semibold ${pnlTone}`}>
            {typeof pnlValue === "number" ? `${pnlValue > 0 ? "+" : ""}${pnlValue.toFixed(2)}` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-zinc-500">Entry / Exit</dt>
          <dd className="mt-0.5">
            {entryPrice !== undefined ? entryPrice : "—"} → {exitPrice !== undefined ? exitPrice : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-zinc-500">Size</dt>
          <dd className="mt-0.5">{positionSize !== undefined ? positionSize : "—"}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-zinc-500">SL / TP</dt>
          <dd className="mt-0.5">
            {stopLoss !== undefined ? stopLoss : "—"} / {takeProfit !== undefined ? takeProfit : "—"}
          </dd>
        </div>
      </dl>

      <footer className="mt-4 flex items-center justify-between">
        <button
          className="rounded border border-cyan-700 px-2 py-1 text-[11px] text-cyan-100 transition hover:bg-cyan-900/20"
          onClick={() => onOpen(note.id)}
        >
          Öffnen
        </button>
        <button
          className="rounded border border-rose-900 px-2 py-1 text-[11px] text-rose-100 transition hover:bg-rose-900/20"
          onClick={() => onDelete(note.id)}
        >
          Löschen
        </button>
      </footer>
    </article>
  );
}

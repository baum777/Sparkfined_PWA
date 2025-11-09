/**
 * BLOCK 3: Updated JournalList for unified schema
 * 
 * New features:
 * - Display setup & emotion tags with badges
 * - Show PnL if closed
 * - Status indicator (temp/active/closed)
 * - Grok context indicator
 * - Better filtering (setup, emotion, status)
 */

import React from "react";
import { TRADE_STATUS_META, computeTradeMetrics } from "./types";
import type { JournalNote } from "./types";

import { useNavigate } from "react-router-dom";
import type { JournalEntry } from "@/types/journal";
import { createSession } from "@/lib/ReplayService";

export default function JournalList({
  entries, onOpen, onDelete, filter
}: {
  entries: JournalEntry[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  filter?: { tag?: string; q?: string; status?: string };
}) {
  const navigate = useNavigate();
  const [creatingReplay, setCreatingReplay] = React.useState<string | null>(null);
  
  const q = filter?.q?.toLowerCase().trim();
  const t = filter?.tag?.toLowerCase().trim();
  const statusFilter = filter?.status;
  
  const items = entries.filter(e => {
    const okQ = !q || [e.ticker, e.thesis || '', e.customTags?.join(" ") || ''].some(s => s?.toLowerCase().includes(q));
    const okT = !t || e.customTags?.map(x=>x.toLowerCase()).includes(t);
    const okStatus = !statusFilter || statusFilter === 'all' || e.status === statusFilter;
    return okQ && okT && okStatus;
  });
  
  // Status badge styles
  const statusStyles = {
    temp: 'bg-amber-950/40 border-amber-800/40 text-amber-300',
    active: 'bg-cyan-950/40 border-cyan-800/40 text-cyan-300',
    closed: 'bg-zinc-900/60 border-zinc-800/40 text-zinc-400',
  }

  // Create or view replay session
  const handleReplay = async (entry: JournalEntry) => {
    // If already has replay session, navigate to it
    if (entry.replaySessionId) {
      navigate(`/replay/${entry.replaySessionId}`);
      return;
    }

    // Create new replay session
    setCreatingReplay(entry.id);
    try {
      const session = await createSession({
        name: `${entry.ticker} Replay`,
        journalEntryId: entry.id,
      });
      
      if (session) {
        navigate(`/replay/${session.id}`);
      }
    } catch (error) {
      console.error("Error creating replay session:", error);
      alert("Failed to create replay session. Check console for details.");
    } finally {
      setCreatingReplay(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {items.map(n => (
        <JournalNoteCard
          key={n.id}
          note={n}
          onOpen={onOpen}
          onDelete={onDelete}
        />

      {items.map(e => (
        <div key={e.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 relative">
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyles[e.status]}`}>
              {e.status}
            </span>
          </div>

          {/* Ticker & Timestamp */}
          <div className="mb-2 flex items-start justify-between pr-16">
            <div>
              <div className="text-sm font-semibold text-zinc-100">{e.ticker}</div>
              <div className="text-[10px] text-zinc-500">{new Date(e.timestamp).toLocaleString()}</div>
            </div>
          </div>

          {/* Screenshot */}
          {e.chartSnapshot?.screenshot && (
            <img 
              src={e.chartSnapshot.screenshot} 
              alt={e.ticker} 
              className="mb-2 h-28 w-full rounded object-cover" 
            />
          )}

          {/* Setup & Emotion Tags */}
          <div className="mb-2 flex flex-wrap gap-1">
            <span className="rounded border border-emerald-700/40 bg-emerald-950/30 px-1.5 py-0.5 text-[10px] text-emerald-300">
              {e.setup}
            </span>
            <span className="rounded border border-purple-700/40 bg-purple-950/30 px-1.5 py-0.5 text-[10px] text-purple-300">
              {e.emotion}
            </span>
            {e.customTags?.map(tag => (
              <span key={tag} className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">
                #{tag}
              </span>
            ))}
          </div>

          {/* Thesis */}
          {e.thesis && (
            <p className="mb-2 line-clamp-2 text-[12px] text-zinc-300">{e.thesis}</p>
          )}

          {/* PnL (if closed) */}
          {e.outcome && (
            <div className={`mb-2 flex items-center gap-2 text-[11px] ${e.outcome.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span className="font-semibold">
                {e.outcome.pnl >= 0 ? '+' : ''}${e.outcome.pnl.toFixed(2)}
              </span>
              <span>({e.outcome.pnlPercent >= 0 ? '+' : ''}{e.outcome.pnlPercent.toFixed(1)}%)</span>
            </div>
          )}

          {/* Indicators */}
          <div className="mb-2 flex items-center gap-2 text-[10px] text-zinc-500">
            {e.grokContext && <span title="Has Grok context">𝕏</span>}
            {e.chartSnapshot?.state && <span title="Has chart state">📊</span>}
            {e.replaySessionId && <span title="Has replay session">🎬</span>}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button 
                className="flex-1 rounded border border-cyan-700 px-2 py-1 text-[11px] text-cyan-100 hover:bg-cyan-900/20" 
                onClick={()=>onOpen(e.id)}
              >
                Edit
              </button>
              <button 
                className="rounded border border-rose-900 px-2 py-1 text-[11px] text-rose-100 hover:bg-rose-900/20" 
                onClick={()=>onDelete(e.id)}
              >
                Delete
              </button>
            </div>
            
            {/* Replay Button */}
            {e.status !== 'temp' && (
              <button
                disabled={creatingReplay === e.id}
                onClick={() => handleReplay(e)}
                className="w-full rounded border border-purple-700/50 bg-purple-950/20 px-2 py-1 text-[11px] text-purple-300 hover:bg-purple-900/30 disabled:opacity-50"
              >
                {creatingReplay === e.id ? '⏳ Creating...' : e.replaySessionId ? '🎬 View Replay' : '🎬 Create Replay'}
              </button>
            )}
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="col-span-full rounded border border-zinc-800 p-6 text-center text-sm text-zinc-400">
          No entries match your filters
        </div>
      )}
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

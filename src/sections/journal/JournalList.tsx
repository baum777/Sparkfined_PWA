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

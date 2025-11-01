import React from "react";
import type { Bookmark } from "./replay/types";

export default function ReplayBar({
  isPlaying, speed, onPlay, onPause, onSpeed, onStep, onJump, bookmarks, onAddBookmark, onDeleteBookmark
}: {
  isPlaying: boolean;
  speed: 1|2|4|8|10;
  onPlay: () => void;
  onPause: () => void;
  onSpeed: (s: 1|2|4|8|10) => void;
  onStep: (dir: -1|1, size?: number) => void;     // ←/→, size optional (1 oder 10)
  onJump: (t: number) => void;                     // jump to timestamp
  bookmarks: Bookmark[];
  onAddBookmark: (label?: string) => void;
  onDeleteBookmark: (id: string) => void;
}) {
  const btn = "rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800";
  const sp = [1,2,4,8,10] as const;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-zinc-300">
      {!isPlaying ? (
        <button className={btn} onClick={onPlay}>Play</button>
      ) : (
        <button className={btn} onClick={onPause}>Pause</button>
      )}
      <div className="flex items-center gap-1">
        {sp.map(s => (
          <button key={s} className={`rounded-lg px-2 py-1 text-[11px] ${speed===s ? "border border-emerald-700 bg-emerald-900/30 text-emerald-100" : "border border-zinc-700 hover:bg-zinc-800"}`} onClick={()=>onSpeed(s)}>{s}x</button>
        ))}
      </div>
      <button className={btn} onClick={()=>onStep(-1,1)} aria-label="Step back 1">←</button>
      <button className={btn} onClick={()=>onStep(1,1)} aria-label="Step forward 1">→</button>
      <button className={btn} onClick={()=>onStep(-1,10)} aria-label="Step back 10">Shift←</button>
      <button className={btn} onClick={()=>onStep(1,10)} aria-label="Step forward 10">Shift→</button>
      <span className="mx-2 text-zinc-600">•</span>
      <button className={btn} onClick={()=>onAddBookmark()}>+ Bookmark</button>
      {bookmarks.length>0 && (
        <div className="flex flex-wrap items-center gap-1">
          {bookmarks.slice(0,6).map(b => (
            <button key={b.id} title={b.label || new Date(b.t).toLocaleString()} className="rounded-lg border border-cyan-700 px-2 py-1 text-[11px] text-cyan-100 hover:bg-cyan-900/20"
              onClick={()=>onJump(b.t)}>
              {b.label ?? new Date(b.t).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
            </button>
          ))}
        </div>
      )}
      {bookmarks.length>0 && <button className="rounded-lg border border-rose-800 px-2 py-1 text-[11px] text-rose-100 hover:bg-rose-900/30" onClick={()=>onDeleteBookmark(bookmarks[0].id)}>Del First</button>}
    </div>
  );
}

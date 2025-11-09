/**
 * ReplayPlayer.tsx
 * 
 * Video-like playback controls for replaying historical trades.
 * Features:
 * - Play/Pause/Scrub timeline
 * - Speed controls (0.5x, 1x, 2x, 4x)
 * - Bookmark important moments
 * - Frame-by-frame navigation
 * - Progress bar with markers for buy/sell events
 */

import React from "react";
import type { ReplaySession, ReplayBookmark } from "@/types/journal";

export interface ReplayPlayerProps {
  session: ReplaySession;
  currentFrame: number;
  totalFrames: number;
  isPlaying: boolean;
  speed: number; // 0.5, 1, 2, 4
  onPlay: () => void;
  onPause: () => void;
  onSeek: (frame: number) => void;
  onSpeedChange: (speed: number) => void;
  onAddBookmark: (bookmark: Omit<ReplayBookmark, "id">) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onJumpToBookmark: (frame: number) => void;
}

export default function ReplayPlayer({
  session,
  currentFrame,
  totalFrames,
  isPlaying,
  speed,
  onPlay,
  onPause,
  onSeek,
  onSpeedChange,
  onAddBookmark,
  onDeleteBookmark,
  onJumpToBookmark,
}: ReplayPlayerProps) {
  const [showBookmarks, setShowBookmarks] = React.useState(false);
  const [bookmarkNote, setBookmarkNote] = React.useState("");

  // Calculate progress percentage
  const progress = totalFrames > 0 ? (currentFrame / totalFrames) * 100 : 0;

  // Format time for display (MM:SS)
  const formatTime = (frame: number) => {
    const seconds = Math.floor(frame / 10); // Assuming 10 FPS
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

    // Find transaction markers (buys/sells) for timeline
    const transactionMarkers = React.useMemo(() => {
      if (!session.ohlcCache) return [];
      
      // Calculate frame positions for transactions
      return session.ohlcCache
        .map((point, idx) => {
          const hasBuy = (point.v || 0) > 0; // Simplified - in reality, check transaction data
          const hasSell = (point.v || 0) < 0;
          if (!hasBuy && !hasSell) return null;
          return {
            frame: idx,
            type: hasBuy ? "buy" : "sell",
            position: (idx / totalFrames) * 100,
          };
        })
        .filter(Boolean) as Array<{ frame: number; type: string; position: number }>;
    }, [session.ohlcCache, totalFrames]);

  // Bookmark markers for timeline
  const bookmarkMarkers = React.useMemo(() => {
    return (session.bookmarks || []).map((bookmark) => ({
      id: bookmark.id,
      frame: bookmark.frame,
      position: (bookmark.frame / totalFrames) * 100,
      note: bookmark.note,
    }));
  }, [session.bookmarks, totalFrames]);

  const handleAddBookmark = () => {
    const note = bookmarkNote.trim() || `Bookmark at ${formatTime(currentFrame)}`;
    onAddBookmark({
      frame: currentFrame,
      timestamp: Date.now(),
      note,
    });
    setBookmarkNote("");
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const targetFrame = Math.floor(percent * totalFrames);
    onSeek(targetFrame);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">
            Replay: {session.name || "Untitled Session"}
          </h3>
          <p className="text-xs text-zinc-500">
            {formatTime(currentFrame)} / {formatTime(totalFrames)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Speed Controls */}
          <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2 py-1">
            {[0.5, 1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  speed === s
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Bookmark Toggle */}
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
              showBookmarks
                ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                : "border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            🔖 Bookmarks ({session.bookmarks?.length || 0})
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-4">
        <div
          className="relative h-12 cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950"
          onClick={handleScrub}
        >
          {/* Progress Bar */}
          <div
            className="absolute left-0 top-0 h-full rounded-lg bg-cyan-500/20 transition-all"
            style={{ width: `${progress}%` }}
          />

          {/* Transaction Markers */}
          {transactionMarkers.map((marker, idx) => (
            <div
              key={`tx-${idx}`}
              className={`absolute top-0 h-full w-1 ${
                marker.type === "buy" ? "bg-green-500" : "bg-red-500"
              }`}
              style={{ left: `${marker.position}%` }}
              title={marker.type === "buy" ? "Buy" : "Sell"}
            />
          ))}

          {/* Bookmark Markers */}
          {bookmarkMarkers.map((bookmark) => (
            <div
              key={bookmark.id}
              className="absolute top-0 flex h-full items-center"
              style={{ left: `${bookmark.position}%` }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onJumpToBookmark(bookmark.frame);
                }}
                className="text-amber-400 hover:text-amber-300"
                title={bookmark.note}
              >
                🔖
              </button>
            </div>
          ))}

          {/* Playhead */}
          <div
            className="absolute top-0 h-full w-0.5 bg-cyan-400"
            style={{ left: `${progress}%` }}
          >
            <div className="absolute -top-1 -left-1.5 h-4 w-4 rounded-full border-2 border-cyan-400 bg-zinc-900" />
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Step Backward */}
        <button
          onClick={() => onSeek(Math.max(0, currentFrame - 10))}
          disabled={currentFrame === 0}
          className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
        >
          ⏮
        </button>

        {/* Play/Pause */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-6 py-2 text-xl font-bold text-cyan-400 transition-all hover:bg-cyan-500/20"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        {/* Step Forward */}
        <button
          onClick={() => onSeek(Math.min(totalFrames, currentFrame + 10))}
          disabled={currentFrame >= totalFrames}
          className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
        >
          ⏭
        </button>

        {/* Add Bookmark */}
        <button
          onClick={handleAddBookmark}
          className="ml-4 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
        >
          🔖 Add Bookmark
        </button>
      </div>

      {/* Bookmark Input (when adding) */}
      {bookmarkNote !== "" && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={bookmarkNote}
            onChange={(e) => setBookmarkNote(e.target.value)}
            placeholder="Bookmark note (optional)..."
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-500/50 focus:outline-none"
          />
          <button
            onClick={handleAddBookmark}
            className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400"
          >
            Save
          </button>
          <button
            onClick={() => setBookmarkNote("")}
            className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-zinc-400"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Bookmarks List */}
      {showBookmarks && (
        <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <h4 className="mb-2 text-xs font-semibold text-zinc-400">
            Bookmarks ({session.bookmarks?.length || 0})
          </h4>
          {!session.bookmarks || session.bookmarks.length === 0 ? (
            <p className="text-xs text-zinc-600">
              No bookmarks yet. Add bookmarks during replay to mark important moments.
            </p>
          ) : (
            <div className="space-y-2">
              {session.bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 p-2"
                >
                  <div className="flex-1">
                    <p className="text-xs font-medium text-zinc-300">
                      {bookmark.note}
                    </p>
                    <p className="text-xs text-zinc-600">
                      {formatTime(bookmark.frame)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onJumpToBookmark(bookmark.frame)}
                      className="rounded px-2 py-1 text-xs text-cyan-400 hover:bg-cyan-500/10"
                    >
                      Jump
                    </button>
                    <button
                      onClick={() => onDeleteBookmark(bookmark.id)}
                      className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Session Info */}
      <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-zinc-600">Journal Entry:</span>{" "}
            <span className="text-zinc-300">
              {session.journalEntryId ? "Linked" : "None"}
            </span>
          </div>
          <div>
            <span className="text-zinc-600">OHLC Cached:</span>{" "}
            <span className="text-zinc-300">
              {session.ohlcCache ? `${session.ohlcCache.length} points` : "No"}
            </span>
          </div>
          <div>
            <span className="text-zinc-600">Created:</span>{" "}
            <span className="text-zinc-300">
              {new Date(session.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-zinc-600">Duration:</span>{" "}
            <span className="text-zinc-300">{formatTime(totalFrames)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="rounded-3xl border border-border/70 bg-surface/80 p-4 shadow-card-subtle">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Replay: {session.name || "Untitled Session"}
          </h3>
          <p className="text-xs text-text-secondary">
            {formatTime(currentFrame)} / {formatTime(totalFrames)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Speed Controls */}
          <div className="flex items-center gap-1 rounded-full border border-border/70 bg-surface/70 px-2 py-1">
            {[0.5, 1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  speed === s
                    ? "bg-info/20 text-info"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Bookmark Toggle */}
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              showBookmarks
                ? "border-warn/60 bg-warn/10 text-warn"
                : "border-border/70 bg-surface/70 text-text-secondary hover:text-text-primary"
            }`}
          >
            🔖 Bookmarks ({session.bookmarks?.length || 0})
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-4">
        <div
          className="relative h-12 cursor-pointer rounded-2xl border border-border/70 bg-surface/80"
          onClick={handleScrub}
        >
          {/* Progress Bar */}
          <div className="absolute left-0 top-0 h-full rounded-2xl bg-info/20 transition-all" style={{ width: `${progress}%` }} />

          {/* Transaction Markers */}
          {transactionMarkers.map((marker, idx) => (
            <div
              key={`tx-${idx}`}
              className={`absolute top-0 h-full w-1 ${
                marker.type === "buy" ? "bg-sentiment-bull" : "bg-sentiment-bear"
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
                className="text-warn hover:text-warn/80"
                title={bookmark.note}
              >
                🔖
              </button>
            </div>
          ))}

          {/* Playhead */}
          <div className="absolute top-0 h-full w-0.5 bg-info" style={{ left: `${progress}%` }}>
            <div className="absolute -top-1 -left-1.5 h-4 w-4 rounded-full border-2 border-info bg-surface/90" />
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Step Backward */}
        <button
          onClick={() => onSeek(Math.max(0, currentFrame - 10))}
          disabled={currentFrame === 0}
          className="rounded-full border border-border/70 bg-surface/70 px-3 py-2 text-text-secondary transition-colors hover:bg-interactive-hover hover:text-text-primary disabled:opacity-50"
        >
          ⏮
        </button>

        {/* Play/Pause */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="rounded-full border border-brand/60 bg-brand/10 px-6 py-2 text-xl font-bold text-brand transition-all hover:bg-brand/20"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        {/* Step Forward */}
        <button
          onClick={() => onSeek(Math.min(totalFrames, currentFrame + 10))}
          disabled={currentFrame >= totalFrames}
          className="rounded-full border border-border/70 bg-surface/70 px-3 py-2 text-text-secondary transition-colors hover:bg-interactive-hover hover:text-text-primary disabled:opacity-50"
        >
          ⏭
        </button>

        {/* Add Bookmark */}
        <button
          onClick={handleAddBookmark}
          className="ml-4 rounded-full border border-warn/60 bg-warn/10 px-4 py-2 text-sm font-medium text-warn transition-colors hover:bg-warn/20"
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
            className="flex-1 rounded-2xl border border-border/70 bg-surface/80 px-3 py-2 text-sm text-text-primary placeholder-text-secondary/70 focus:border-brand focus:outline-none"
          />
          <button
            onClick={handleAddBookmark}
            className="rounded-full border border-success/50 bg-success/10 px-4 py-2 text-sm font-medium text-success"
          >
            Save
          </button>
          <button
            onClick={() => setBookmarkNote("")}
            className="rounded-full border border-border/70 bg-surface/70 px-4 py-2 text-sm font-medium text-text-secondary"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Bookmarks List */}
      {showBookmarks && (
        <div className="mt-4 rounded-2xl border border-border/70 bg-surface/80 p-3">
          <h4 className="mb-2 text-xs font-semibold text-text-secondary">
            Bookmarks ({session.bookmarks?.length || 0})
          </h4>
          {!session.bookmarks || session.bookmarks.length === 0 ? (
            <p className="text-xs text-text-secondary">
              No bookmarks yet. Add bookmarks during replay to mark important moments.
            </p>
          ) : (
            <div className="space-y-2">
              {session.bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-surface/70 p-2"
                >
                  <div className="flex-1">
                    <p className="text-xs font-medium text-text-primary">
                      {bookmark.note}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatTime(bookmark.frame)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onJumpToBookmark(bookmark.frame)}
                      className="rounded px-2 py-1 text-xs text-info hover:bg-info/10"
                    >
                      Jump
                    </button>
                    <button
                      onClick={() => onDeleteBookmark(bookmark.id)}
                      className="rounded px-2 py-1 text-xs text-danger hover:bg-danger/10"
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
      <div className="mt-4 rounded-2xl border border-border/70 bg-surface/80 p-3">
        <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
          <div>
            <span className="text-text-tertiary">Journal Entry:</span>{" "}
            <span className="text-text-primary">
              {session.journalEntryId ? "Linked" : "None"}
            </span>
          </div>
          <div>
            <span className="text-text-tertiary">OHLC Cached:</span>{" "}
            <span className="text-text-primary">
              {session.ohlcCache ? `${session.ohlcCache.length} points` : "No"}
            </span>
          </div>
          <div>
            <span className="text-text-tertiary">Created:</span>{" "}
            <span className="text-text-primary">
              {new Date(session.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-text-tertiary">Duration:</span>{" "}
            <span className="text-text-primary">{formatTime(totalFrames)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

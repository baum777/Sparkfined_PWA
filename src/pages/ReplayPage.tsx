/**
 * ReplayPage.tsx
 * 
 * Main page for Replay feature - combines:
 * - ReplayPlayer (playback controls)
 * - Chart visualization (synced with replay frame)
 * - PatternDashboard (analytics & pattern library)
 * 
 * Can be accessed:
 * - From Journal entry with "View Replay" button
 * - Directly from navigation for pattern analysis
 * - From PatternDashboard by clicking a pattern
 */

import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ReplayPlayer from "@/components/ReplayPlayer";
import PatternDashboard from "@/components/PatternDashboard";
import type { ReplaySession, JournalEntry, ReplayBookmark, SetupTag, EmotionTag } from "@/types/journal";
import {
  getSession,
  updateSession,
  addBookmark,
  deleteBookmark,
  listSessions,
  cacheOhlcData,
} from "@/lib/ReplayService";
import { calculatePatternStats, queryEntries } from "@/lib/JournalService";

type ViewMode = "player" | "dashboard";

export default function ReplayPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [viewMode, setViewMode] = React.useState<ViewMode>(
    sessionId ? "player" : "dashboard"
  );
  const [session, setSession] = React.useState<ReplaySession | null>(null);
  const [currentFrame, setCurrentFrame] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  // Dashboard state
  const [entries, setEntries] = React.useState<JournalEntry[]>([]);
  const [patternStats, setPatternStats] = React.useState<any>(null);
  const [filteredSetup, setFilteredSetup] = React.useState<SetupTag | undefined>();
  const [filteredEmotion, setFilteredEmotion] = React.useState<EmotionTag | undefined>();

  // Load session if sessionId provided
  React.useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId]);

  // Load dashboard data
  React.useEffect(() => {
    if (viewMode === "dashboard") {
      loadDashboardData();
    }
  }, [viewMode]);

  // Playback loop
  React.useEffect(() => {
    if (!isPlaying || !session || !session.ohlcCache) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = prev + 1;
        if (next >= session.ohlcCache!.length) {
          setIsPlaying(false);
          return session.ohlcCache!.length - 1;
        }
        return next;
      });
    }, 1000 / speed); // Adjust speed

    return () => clearInterval(interval);
  }, [isPlaying, speed, session]);

  // Load session
  const loadSession = async (id: string) => {
    setLoading(true);
    try {
      const loaded = await getSession(id);
      if (loaded) {
        setSession(loaded);
        setCurrentFrame(0);
        
        // If no OHLC cache, fetch and cache it
        if (!loaded.ohlcCache) {
          await fetchAndCacheOhlc(loaded);
        }
      } else {
        console.error("Session not found:", id);
        // Fallback to dashboard
        setViewMode("dashboard");
      }
    } catch (error) {
      console.error("Error loading session:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch and cache OHLC data
  const fetchAndCacheOhlc = async (sess: ReplaySession) => {
    try {
      // TODO[P1]: Fetch actual OHLC data from Moralis API instead of mock
      // For now, generate mock data
      const mockOhlc = Array.from({ length: 100 }, (_, i) => ({
        t: Date.now() - (100 - i) * 60000,
        o: 0.001 + Math.random() * 0.0001,
        h: 0.001 + Math.random() * 0.0001 + 0.00001,
        l: 0.001 + Math.random() * 0.0001 - 0.00001,
        c: 0.001 + Math.random() * 0.0001,
        v: Math.random() * 1000,
      }));

      const updated = await cacheOhlcData(sess.id, mockOhlc);
      if (updated) {
        setSession(updated);
      }
    } catch (error) {
      console.error("Error caching OHLC:", error);
    }
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const allEntries = await queryEntries({ status: "all" });
      setEntries(allEntries);

      const stats = await calculatePatternStats(allEntries);
      setPatternStats(stats);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Playback controls
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleSeek = (frame: number) => {
    setCurrentFrame(frame);
    setIsPlaying(false);
  };
  const handleSpeedChange = (newSpeed: number) => setSpeed(newSpeed);

  // Bookmark controls
  const handleAddBookmark = async (bookmark: Omit<ReplayBookmark, "id">) => {
    if (!session) return;
    
    const updated = await addBookmark(session.id, bookmark);
    if (updated) {
      setSession(updated);
    }
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    if (!session) return;
    
    const updated = await deleteBookmark(session.id, bookmarkId);
    if (updated) {
      setSession(updated);
    }
  };

  const handleJumpToBookmark = (frame: number) => {
    setCurrentFrame(frame);
    setIsPlaying(false);
  };

  // Dashboard controls
  const handleFilterByPattern = (setup?: SetupTag, emotion?: EmotionTag) => {
    setFilteredSetup(setup);
    setFilteredEmotion(emotion);
    
    // Filter entries
    const filtered = entries.filter((e) => {
      if (setup && e.setup !== setup) return false;
      if (emotion && e.emotion !== emotion) return false;
      return true;
    });
    
    // Update stats with filtered entries
    calculatePatternStats(filtered).then(setPatternStats);
  };

  const handleViewEntry = (entryId: string) => {
    navigate(`/journal?entry=${entryId}`);
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "player" ? "dashboard" : "player"));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-sm text-zinc-500">Loading replay...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">
              {viewMode === "player" ? "🎬 Replay Player" : "📊 Pattern Dashboard"}
            </h1>
            <p className="text-sm text-zinc-500">
              {viewMode === "player"
                ? "Playback and analyze your trades frame-by-frame"
                : "Discover patterns and insights from your trading history"}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <button
              onClick={toggleViewMode}
              className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
            >
              {viewMode === "player" ? "📊 Dashboard" : "🎬 Player"}
            </button>

            {/* Back Button */}
            <button
              onClick={() => navigate("/journal")}
              className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
            >
              ← Journal
            </button>
          </div>
        </div>

        {/* Player View */}
        {viewMode === "player" && session && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Chart Area (2/3 width on large screens) */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-200">
                    📈 Chart View
                  </h3>
                  <button
                    onClick={() => navigate(`/chart?replaySession=${session.id}`)}
                    className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20"
                  >
                    Open in Chart →
                  </button>
                </div>
                
                {/* Chart Canvas (placeholder) */}
                <div className="relative aspect-video rounded-lg bg-zinc-950">
                  {session.ohlcCache && session.ohlcCache[currentFrame] && (
                    <div className="flex h-full flex-col items-center justify-center">
                      <p className="mb-2 text-xs text-zinc-600">
                        Frame {currentFrame + 1} / {session.ohlcCache.length}
                      </p>
                      <div className="text-center">
                        <p className="text-sm text-zinc-400">
                          O: {session.ohlcCache[currentFrame].o.toFixed(6)}
                        </p>
                        <p className="text-sm text-zinc-400">
                          H: {session.ohlcCache[currentFrame].h.toFixed(6)}
                        </p>
                        <p className="text-sm text-zinc-400">
                          L: {session.ohlcCache[currentFrame].l.toFixed(6)}
                        </p>
                        <p className="text-lg font-bold text-zinc-200">
                          C: {session.ohlcCache[currentFrame].c.toFixed(6)}
                        </p>
                        <p className="mt-2 text-xs text-zinc-600">
                          Vol: {session.ohlcCache[currentFrame].v?.toFixed(2) || 'N/A'}
                        </p>
                      </div>
                      <p className="mt-4 text-xs text-zinc-700">
                        🎨 Chart integration coming next...
                      </p>
                    </div>
                  )}
                  
                  {!session.ohlcCache && (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-xs text-zinc-600">
                        No OHLC data cached
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Player Controls (1/3 width on large screens) */}
            <div className="lg:col-span-1">
              <ReplayPlayer
                session={session}
                currentFrame={currentFrame}
                totalFrames={session.ohlcCache?.length || 0}
                isPlaying={isPlaying}
                speed={speed}
                onPlay={handlePlay}
                onPause={handlePause}
                onSeek={handleSeek}
                onSpeedChange={handleSpeedChange}
                onAddBookmark={handleAddBookmark}
                onDeleteBookmark={handleDeleteBookmark}
                onJumpToBookmark={handleJumpToBookmark}
              />
            </div>
          </div>
        )}

        {/* Player View - No Session */}
        {viewMode === "player" && !session && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
            <div className="mb-4 text-6xl">🎬</div>
            <h2 className="mb-2 text-xl font-bold text-zinc-200">
              No Replay Session Selected
            </h2>
            <p className="mb-6 text-sm text-zinc-500">
              Select a journal entry and create a replay session, or browse patterns in the dashboard.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setViewMode("dashboard")}
                className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20"
              >
                📊 View Dashboard
              </button>
              <button
                onClick={() => navigate("/journal")}
                className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
              >
                ← Back to Journal
              </button>
            </div>
          </div>
        )}

        {/* Dashboard View */}
        {viewMode === "dashboard" && (
          <div>
            {patternStats ? (
              <PatternDashboard
                stats={patternStats}
                entries={entries}
                onFilterByPattern={handleFilterByPattern}
                onViewEntry={handleViewEntry}
              />
            ) : (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
                <div className="mb-4 text-6xl">📊</div>
                <h2 className="mb-2 text-xl font-bold text-zinc-200">
                  No Data Yet
                </h2>
                <p className="text-sm text-zinc-500">
                  Close some trades in your journal to see pattern analysis.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

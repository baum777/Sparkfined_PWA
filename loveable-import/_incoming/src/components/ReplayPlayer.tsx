import { useState, useCallback } from "react";
import { Play, Pause, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { type ReplaySession, formatTime } from "@/features/chart/replay";

interface ReplayPlayerProps {
  session: ReplaySession;
  onLogToJournal: () => void;
}

export function ReplayPlayer({ session, onLogToJournal }: ReplayPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState("1");
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    setCurrentTime(value[0]);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentTime((prev) => Math.max(0, prev - 10));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentTime((prev) => Math.min(session.duration, prev + 10));
      }
    },
    [togglePlay, session.duration]
  );

  const progress = (currentTime / session.duration) * 100;

  return (
    <div
      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Chart placeholder */}
      <div className="flex h-48 items-center justify-center rounded-md bg-secondary/30 text-muted-foreground sm:h-64">
        <span className="text-sm">
          {session.symbol} — Replay at {formatTime(currentTime)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span className="w-12 text-xs text-muted-foreground">
          {formatTime(currentTime)}
        </span>
        <Slider
          value={[currentTime]}
          max={session.duration}
          step={1}
          onValueChange={handleSeek}
          className="flex-1"
          aria-label="Replay progress"
        />
        <span className="w-12 text-right text-xs text-muted-foreground">
          {formatTime(session.duration)}
        </span>
      </div>

      {/* Compact progress cue */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={currentTime}
          aria-valuemin={0}
          aria-valuemax={session.duration}
          aria-label="Replay progress"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            aria-label="Reset replay"
            className="focus-visible:ring-2 focus-visible:ring-ring"
            data-testid="replay-reset-btn"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause replay" : "Play replay"}
            className="focus-visible:ring-2 focus-visible:ring-ring"
            data-testid="replay-play-btn"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Select value={speed} onValueChange={setSpeed}>
            <SelectTrigger
              className="w-20 focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Playback speed"
              data-testid="replay-speed-select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">0.5x</SelectItem>
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="secondary"
          onClick={onLogToJournal}
          className="focus-visible:ring-2 focus-visible:ring-ring"
          data-testid="replay-log-journal-btn"
        >
          Log insights to Journal
        </Button>
      </div>

      {/* Keyboard shortcut hint */}
      <p className="text-center text-xs text-muted-foreground/70">
        Space to play/pause • Arrow keys to seek
      </p>

      {/* Collapsible session info */}
      <Collapsible open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={isInfoOpen}
          >
            <span>Session details</span>
            {isInfoOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 rounded-md bg-secondary/30 p-3 text-sm">
          <dl className="grid grid-cols-2 gap-2 text-muted-foreground">
            <dt>Session ID</dt>
            <dd className="text-foreground">{session.id}</dd>
            <dt>Symbol</dt>
            <dd className="text-foreground">{session.symbol}</dd>
            <dt>Date</dt>
            <dd className="text-foreground">{session.date}</dd>
            <dt>Duration</dt>
            <dd className="text-foreground">{formatTime(session.duration)}</dd>
          </dl>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

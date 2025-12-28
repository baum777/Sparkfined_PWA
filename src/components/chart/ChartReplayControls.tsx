import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatTime } from "@/features/chart/replay";
import { cn } from "@/lib/utils";

interface ChartReplayControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: string;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: string) => void;
  onReset: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  className?: string;
}

export function ChartReplayControls({
  isPlaying,
  currentTime,
  duration,
  speed,
  onPlayPause,
  onSeek,
  onSpeedChange,
  onReset,
  onStepBack,
  onStepForward,
  className,
}: ChartReplayControlsProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3",
        className
      )}
      data-testid="chart-replay-controls"
    >
      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <span className="w-12 text-xs font-mono text-muted-foreground">
          {formatTime(currentTime)}
        </span>
        <Slider
          value={[currentTime]}
          max={duration}
          step={1}
          onValueChange={([value]) => onSeek(value)}
          className="flex-1"
          aria-label="Replay progress"
          data-testid="replay-progress-slider"
        />
        <span className="w-12 text-right text-xs font-mono text-muted-foreground">
          {formatTime(duration)}
        </span>
      </div>

      {/* Mini progress indicator */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            aria-label="Reset to start"
            className="h-8 w-8"
            data-testid="replay-reset-btn"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onStepBack}
            aria-label="Step back 10 seconds"
            className="h-8 w-8"
            data-testid="replay-step-back-btn"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={onPlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="h-9 w-9"
            data-testid="replay-play-btn"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onStepForward}
            aria-label="Step forward 10 seconds"
            className="h-8 w-8"
            data-testid="replay-step-forward-btn"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Speed:</span>
          <Select value={speed} onValueChange={onSpeedChange}>
            <SelectTrigger
              className="h-8 w-16 text-xs"
              aria-label="Playback speed"
              data-testid="replay-speed-select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">0.5x</SelectItem>
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
              <SelectItem value="4">4x</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="hidden text-xs text-muted-foreground sm:block">
          Space: play/pause • ←→: seek
        </p>
      </div>
    </div>
  );
}

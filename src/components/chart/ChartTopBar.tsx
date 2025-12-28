import { Menu, Download, Settings2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"];

interface ChartTopBarProps {
  selectedTimeframe: string;
  onTimeframeChange: (tf: string) => void;
  isReplayMode: boolean;
  onToggleReplay: () => void;
  onMenuClick?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  showMenuButton?: boolean;
  className?: string;
}

export function ChartTopBar({
  selectedTimeframe,
  onTimeframeChange,
  isReplayMode,
  onToggleReplay,
  onMenuClick,
  onExport,
  onSettings,
  showMenuButton = false,
  className,
}: ChartTopBarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 border-b border-border bg-card px-3 py-2",
        className
      )}
      data-testid="chart-topbar"
    >
      {/* Left: Menu (mobile) */}
      <div className="flex items-center gap-2">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-8 w-8"
            data-testid="chart-menu-btn"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Center: Timeframes */}
      <div className="flex items-center gap-1 overflow-x-auto" data-testid="chart-timeframes">
        {TIMEFRAMES.map((tf) => (
          <Button
            key={tf}
            variant={selectedTimeframe === tf ? "default" : "ghost"}
            size="sm"
            onClick={() => onTimeframeChange(tf)}
            className="h-7 px-2.5 text-xs"
            data-testid={`chart-tf-${tf}`}
          >
            {tf}
          </Button>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant={isReplayMode ? "default" : "outline"}
          size="sm"
          onClick={onToggleReplay}
          className={cn("h-7 gap-1.5 text-xs", isReplayMode && "bg-primary")}
          data-testid="chart-replay-toggle"
        >
          <Play className="h-3.5 w-3.5" />
          Replay
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onExport}
          className="h-8 w-8"
          data-testid="chart-export-btn"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettings}
          className="h-8 w-8 sm:hidden"
          data-testid="chart-settings-btn"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

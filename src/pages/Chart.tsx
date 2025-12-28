import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { ChartTopBar } from "@/components/chart/ChartTopBar";
import { ChartSidebar } from "@/components/chart/ChartSidebar";
import { ChartRightPanel } from "@/components/chart/ChartRightPanel";
import { ChartBottomTabs } from "@/components/chart/ChartBottomTabs";
import { ChartReplayControls } from "@/components/chart/ChartReplayControls";
import { ChartToolbar } from "@/components/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Chart() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();

  // State
  const [selectedMarket, setSelectedMarket] = useState("BTC/USD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1H");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Replay state
  const isReplayMode = searchParams.get("replay") === "true";
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState("1");
  const replayDuration = 600; // 10 minutes demo

  const handleToggleReplay = useCallback(() => {
    if (isReplayMode) {
      searchParams.delete("replay");
      setSearchParams(searchParams);
      setIsPlaying(false);
      setCurrentTime(0);
    } else {
      searchParams.set("replay", "true");
      setSearchParams(searchParams);
    }
  }, [isReplayMode, searchParams, setSearchParams]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const handleStepBack = useCallback(() => {
    setCurrentTime((prev) => Math.max(0, prev - 10));
  }, []);

  const handleStepForward = useCallback(() => {
    setCurrentTime((prev) => Math.min(replayDuration, prev + 10));
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isReplayMode) return;
      
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handlePlayPause();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleStepBack();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleStepForward();
      }
    },
    [isReplayMode, handlePlayPause, handleStepBack, handleStepForward]
  );

  return (
    <div
      className="flex h-full flex-col"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      data-testid="page-chart"
    >
      {/* Top Bar */}
      <ChartTopBar
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        isReplayMode={isReplayMode}
        onToggleReplay={handleToggleReplay}
        onMenuClick={() => setSidebarOpen(true)}
        showMenuButton={isMobile}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Left Sidebar - Markets */}
        {!isMobile && (
          <ChartSidebar
            selectedMarket={selectedMarket}
            onMarketSelect={setSelectedMarket}
            className="w-52 shrink-0"
          />
        )}

        {/* Chart Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-border p-2">
            <ChartToolbar />
          </div>

          {/* Replay Controls (when active) */}
          {isReplayMode && (
            <div className="border-b border-border p-3">
              <ChartReplayControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={replayDuration}
                speed={speed}
                onPlayPause={handlePlayPause}
                onSeek={handleSeek}
                onSpeedChange={setSpeed}
                onReset={handleReset}
                onStepBack={handleStepBack}
                onStepForward={handleStepForward}
              />
            </div>
          )}

          {/* Canvas */}
          <div
            className="flex flex-1 items-center justify-center bg-muted/20"
            data-testid="chart-canvas-container"
          >
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">
                  {selectedMarket} • {selectedTimeframe}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isReplayMode
                    ? "Replay mode active. Use controls to navigate historical data."
                    : "Chart canvas ready. Connect a charting provider to view live data."}
                </p>
                {!isReplayMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleReplay}
                    className="mt-2"
                  >
                    Try Replay Mode
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Tabs */}
          <ChartBottomTabs symbol={selectedMarket} />
        </div>

        {/* Desktop Right Panel - Tools & Indicators */}
        {!isMobile && (
          <ChartRightPanel className="w-56 shrink-0" />
        )}
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b border-border p-4">
            <SheetTitle>Markets</SheetTitle>
          </SheetHeader>
          <ChartSidebar
            selectedMarket={selectedMarket}
            onMarketSelect={(symbol) => {
              setSelectedMarket(symbol);
              setSidebarOpen(false);
            }}
            className="border-0"
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

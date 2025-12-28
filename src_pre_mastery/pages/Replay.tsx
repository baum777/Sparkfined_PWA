import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReplayPlayer } from "@/components/ReplayPlayer";
import { DEMO_SESSION, type ReplaySession } from "@/features/chart/replay";

export default function Replay() {
  const navigate = useNavigate();
  const [activeSession, setActiveSession] = useState<ReplaySession | null>(
    null
  );

  const handleStartDemo = useCallback(() => {
    setActiveSession(DEMO_SESSION);
  }, []);

  const handleLogToJournal = useCallback(() => {
    if (activeSession) {
      navigate(
        `/journal?source=replay&symbol=${encodeURIComponent(activeSession.symbol)}`
      );
    } else {
      navigate("/journal?source=replay");
    }
  }, [navigate, activeSession]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6" data-testid="page-replay">
      <header>
        <h1 className="text-2xl font-bold" data-testid="replay-heading">
          Chart Replay
        </h1>
        <p className="mt-1 text-muted-foreground">
          Practice reading price action on historical data.
        </p>
      </header>

      {activeSession ? (
        <ReplayPlayer
          session={activeSession}
          onLogToJournal={handleLogToJournal}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Play className="h-8 w-8 text-primary" />
          </div>
          <p className="max-w-sm text-muted-foreground">
            No session selected. Start a demo replay to practice reading charts
            and logging insights.
          </p>
          <Button
            size="lg"
            onClick={handleStartDemo}
            className="focus-visible:ring-2 focus-visible:ring-ring"
            data-testid="start-replay-btn"
          >
            Start Demo Replay
          </Button>
        </div>
      )}
    </div>
  );
}

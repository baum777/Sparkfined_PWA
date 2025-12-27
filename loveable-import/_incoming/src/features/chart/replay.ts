// Replay state utilities (session-scoped)

export interface ReplaySession {
  id: string;
  symbol: string;
  date: string;
  duration: number; // seconds
}

export const DEMO_SESSION: ReplaySession = {
  id: "demo-001",
  symbol: "BTC/USD",
  date: "2024-12-20",
  duration: 600, // 10 minutes
};

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Replay state utilities (session-scoped)

export interface ReplaySession {
  id: string;
  symbol: string;
  date: string;
  duration: number; // seconds
}

export interface ReplayState {
  enabled: boolean;
  speed: 0.5 | 1 | 2 | 4;
}

export const DEFAULT_REPLAY_STATE: ReplayState = {
  enabled: false,
  speed: 1,
};

export const DEMO_SESSION: ReplaySession = {
  id: "demo-001",
  symbol: "BTC/USD",
  date: "2024-12-20",
  duration: 600, // 10 minutes
};

export function toggleReplay(state: ReplayState): ReplayState {
  return { ...state, enabled: !state.enabled };
}

export function setReplaySpeed(state: ReplayState, speed: ReplayState["speed"]): ReplayState {
  if (state.speed === speed) return state;
  return { ...state, speed };
}

export function getReplaySpeedLabel(speed: number): string {
  return `${speed}x`;
}

export function getReplayStatusLabel(state: ReplayState): string {
  return state.enabled ? "Replay: On" : "Replay: Off";
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

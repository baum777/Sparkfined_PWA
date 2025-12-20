export type ReplaySpeed = 0.5 | 1 | 2 | 4

export interface ReplayState {
  enabled: boolean
  speed: ReplaySpeed
}

export const REPLAY_SPEEDS: ReplaySpeed[] = [0.5, 1, 2, 4]

export const DEFAULT_REPLAY_STATE: ReplayState = {
  enabled: false,
  speed: 1,
}

export const toggleReplay = (state: ReplayState): ReplayState => ({
  ...state,
  enabled: !state.enabled,
})

export const setReplaySpeed = (state: ReplayState, speed: ReplaySpeed): ReplayState => {
  if (state.speed === speed) return state
  return {
    ...state,
    speed,
  }
}

export const getReplaySpeedLabel = (speed: ReplaySpeed): string => `${speed}x`

export const getReplayStatusLabel = (state: ReplayState): string => (state.enabled ? "Replay: On" : "Replay: Off")

import { describe, expect, it } from "vitest"
import {
  DEFAULT_REPLAY_STATE,
  getReplaySpeedLabel,
  getReplayStatusLabel,
  setReplaySpeed,
  toggleReplay,
} from "@/features/chart/replay"

describe("replay helpers", () => {
  it("toggles replay enabled state", () => {
    const next = toggleReplay(DEFAULT_REPLAY_STATE)
    expect(next.enabled).toBe(true)
    expect(next.speed).toBe(DEFAULT_REPLAY_STATE.speed)
  })

  it("keeps speed when toggling", () => {
    const initial = { enabled: false, speed: 2 as const }
    const next = toggleReplay(initial)
    expect(next.enabled).toBe(true)
    expect(next.speed).toBe(2)
  })

  it("updates replay speed", () => {
    const next = setReplaySpeed(DEFAULT_REPLAY_STATE, 4)
    expect(next.speed).toBe(4)
  })

  it("returns same state when speed unchanged", () => {
    const next = setReplaySpeed(DEFAULT_REPLAY_STATE, DEFAULT_REPLAY_STATE.speed)
    expect(next).toBe(DEFAULT_REPLAY_STATE)
  })

  it("formats speed and status labels", () => {
    expect(getReplaySpeedLabel(0.5)).toBe("0.5x")
    expect(getReplayStatusLabel({ enabled: true, speed: 1 })).toBe("Replay: On")
  })
})

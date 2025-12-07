import { create } from "zustand";
import type { PushQueueEntry, PushQueueStatus } from "../types/push";

interface PushQueueState {
  attempts: PushQueueEntry[];
  lastStatus?: PushQueueStatus;
  lastReason?: string;
  recordAttempt: (entry: Omit<PushQueueEntry, "id" | "createdAt">) => PushQueueEntry;
  clear: () => void;
}

const genId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `push-${Date.now()}-${Math.random().toString(16).slice(2)}`);

export const usePushQueueStore = create<PushQueueState>((set) => ({
  attempts: [],
  recordAttempt: (entry) => {
    const next: PushQueueEntry = {
      ...entry,
      id: genId(),
      createdAt: Date.now(),
    };
    set((state) => ({
      attempts: [next, ...state.attempts].slice(0, 25),
      lastStatus: next.status,
      lastReason: next.reason,
    }));
    return next;
  },
  clear: () => set({ attempts: [], lastStatus: undefined, lastReason: undefined }),
}));

import { create } from "zustand";

type AIContextState = {
  activeIdeaId?: string;
  activeJournalId?: string;
  tokenUsed: number;
  tokenBudget: number;
  provider?: string;
  setActive: (ideaId?: string, journalId?: string) => void;
  addTokens: (n: number) => void;
  reset: () => void;
};

export const useAIContext = create<AIContextState>((set, get) => ({
  tokenUsed: 0,
  tokenBudget: 100000,
  setActive: (i, j) => set({ activeIdeaId: i, activeJournalId: j }),
  addTokens: (n) => set({ tokenUsed: get().tokenUsed + n }),
  reset: () => set({ tokenUsed: 0 })
}));

import { create } from 'zustand'
import type { TradeContext } from '@/features/journal-v2/types'

export interface TradeEventJournalBridgeState {
  tradeContext?: TradeContext
  setTradeContext: (context: TradeContext) => void
  clearTradeContext: () => void
}

export const useTradeEventJournalBridge = create<TradeEventJournalBridgeState>((set) => ({
  tradeContext: undefined,
  setTradeContext: (context) => set({ tradeContext: context }),
  clearTradeContext: () => set({ tradeContext: undefined }),
}))

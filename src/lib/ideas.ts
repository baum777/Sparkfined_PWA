export type TF = "1m"|"5m"|"15m"|"1h"|"4h"|"1d";
export type IdeaStatus = "draft"|"active"|"closed";
export type TradeSide = "long"|"short";

export type Idea = {
  id: string;
  userId: string;
  address: string;      // CA
  tf: TF;
  side: TradeSide;
  title: string;
  thesis?: string;      // kurzer Satz
  entry?: number;
  invalidation?: number;
  targets?: number[];   // TPs
  status: IdeaStatus;
  createdAt: number;
  updatedAt: number;
  links: {
    ruleId?: string;        // ServerRule.id
    journalId?: string;     // JournalNote.id
  };
  flags?: {
    watchAdded?: boolean;   // Watchlist Sync
    aiDraftAttached?: boolean;
  }
  outcome?: {
    exitPrice?: number;
    entryPrice?: number;
    pnlAbs?: number;        // quote currency
    pnlPct?: number;        // %
    durationMs?: number;    // exitAt - createdAt
    exitAt?: number;        // ts
    note?: string;          // short summary
  };
  timeline?: Array<{
    ts: number;             // epoch ms
    type: "created"|"note"|"rule_trigger"|"manual_update"|"closed";
    meta?: Record<string, any>;
  }>;
  // --- Playbook/Risk snapshot (persisted at apply time)
  risk?: {
    balance?: number;
    riskPct?: number;
    atrMult?: number;
    entryPrice?: number;
    stopPrice?: number;
    sizeUnits?: number;
    riskAmount?: number;
    rrTargets?: number[];
    rrList?: number[];
    kellyLitePct?: number;
  };
};

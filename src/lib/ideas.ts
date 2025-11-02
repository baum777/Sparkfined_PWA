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
};

export interface Trade {
  id: string;
  asset: string;
  direction: "long" | "short";
  entryPrice: string;
  entryDate: string;
  exitPrice?: string;
  pnl?: string;
  notes?: string;
  tags?: string;
  createdAt: string;
}

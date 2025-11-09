export type Timeframe =
  | "1m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "4h"
  | "1d"
  | "1w";

export const TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"];

export type TradeStatus =
  | "idea"
  | "entered"
  | "running"
  | "winner"
  | "loser"
  | "breakeven"
  | "cancelled";

export const TRADE_STATUSES: TradeStatus[] = ["idea", "entered", "running", "winner", "loser", "breakeven", "cancelled"];

export type TradeStatusMeta = {
  label: string;
  emoji: string;
  tone: "neutral" | "positive" | "negative" | "info";
};

export const TRADE_STATUS_META: Record<TradeStatus, TradeStatusMeta> = {
  idea: { label: "Idea", emoji: "💡", tone: "info" },
  entered: { label: "Entered", emoji: "🎯", tone: "info" },
  running: { label: "Running", emoji: "🏃", tone: "info" },
  winner: { label: "Winner", emoji: "🏆", tone: "positive" },
  loser: { label: "Loser", emoji: "🔻", tone: "negative" },
  breakeven: { label: "Breakeven", emoji: "⚖️", tone: "neutral" },
  cancelled: { label: "Cancelled", emoji: "🚫", tone: "neutral" },
};

export function isTradeStatus(value: unknown): value is TradeStatus {
  return typeof value === "string" && (TRADE_STATUSES as string[]).includes(value);
}

export function isTimeframe(value: unknown): value is Timeframe {
  return typeof value === "string" && (TIMEFRAMES as string[]).includes(value);
}

export type JournalNote = {
  id: string;
  createdAt: number;
  updatedAt: number;
  title?: string;
  body: string;
  tags: string[];
  screenshotDataUrl?: string;
  permalink?: string;
  address?: string;
  tf?: Timeframe;
  ruleId?: string;
  aiAttachedAt?: number;
  status?: TradeStatus;
  setupName?: string;
  entryPrice?: number;
  exitPrice?: number;
  positionSize?: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl?: number;
  pnlPercent?: number;
  riskRewardRatio?: number;
};

export type TradeMetricsInput = Pick<
  JournalNote,
  "entryPrice" | "exitPrice" | "positionSize" | "stopLoss" | "takeProfit"
>;

export type TradeMetrics = Pick<JournalNote, "pnl" | "pnlPercent" | "riskRewardRatio"> & {
  risk?: number;
  reward?: number;
};

export function computeTradeMetrics(input: TradeMetricsInput): TradeMetrics {
  const { entryPrice, exitPrice, positionSize, stopLoss, takeProfit } = input;
  const missingCore = entryPrice === undefined || exitPrice === undefined || positionSize === undefined;

  if (missingCore || !Number.isFinite(entryPrice) || !Number.isFinite(exitPrice) || !Number.isFinite(positionSize)) {
    return { pnl: undefined, pnlPercent: undefined, riskRewardRatio: undefined };
  }

  const pnl = (exitPrice - entryPrice) * positionSize;
  const pnlPercent = entryPrice === 0 ? undefined : ((exitPrice - entryPrice) / entryPrice) * 100;

  let risk: number | undefined;
  let reward: number | undefined;

  if (stopLoss !== undefined && Number.isFinite(stopLoss)) {
    risk = Math.abs(entryPrice - stopLoss);
  }
  if (takeProfit !== undefined && Number.isFinite(takeProfit)) {
    reward = Math.abs(takeProfit - entryPrice);
  }

  const riskRewardRatio =
    risk && reward && risk !== 0
      ? reward / risk
      : undefined;

  return {
    pnl,
    pnlPercent,
    riskRewardRatio,
    risk,
    reward,
  };
}

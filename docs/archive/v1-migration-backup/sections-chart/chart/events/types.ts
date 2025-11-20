export type ChartEvent = {
  id: string;
  t: number;            // unix ms (aligns with OHLC.t where possible)
  kind: "alert" | "bookmark" | "note";
  payload?: Record<string, unknown>;
  createdAt: number;
};

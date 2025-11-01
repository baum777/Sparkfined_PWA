// Timeframe-Helper
export type TF = "1m"|"5m"|"15m"|"1h"|"4h"|"1d";
export function tfMinutes(tf: TF): number {
  switch(tf){
    case "1m": return 1;
    case "5m": return 5;
    case "15m": return 15;
    case "1h": return 60;
    case "4h": return 240;
    case "1d": return 1440;
    default: return 15;
  }
}
export const MS = { min:60_000, hour:3_600_000, day:86_400_000 };

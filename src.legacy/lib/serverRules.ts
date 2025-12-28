export type TF = "1m"|"5m"|"15m"|"1h"|"4h"|"1d";
export type Rule =
  | { id:string; kind:"price-cross"; op:">"|"<"; value:number }
  | { id:string; kind:"pct-change-24h"; op:">"|"<"; value:number }
  | { id:string; kind:"breakout-atrx"; dir:"up"|"down"; mult:number; period?:number }
  | { id:string; kind:"vwap-cross"; dir:"above"|"below" }
  | { id:string; kind:"sma50-200-cross"; typ:"golden"|"death" };

export type ServerRule = {
  id: string;              // rule id
  userId: string;          // owner
  address: string;         // CA
  tf: TF;                  // timeframe
  active: boolean;         // on/off
  createdAt: number;       // ms
  updatedAt: number;       // ms
  rule: Rule;              // payload
};

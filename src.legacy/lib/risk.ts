// Minimal Risk/Size Toolkit (spot-like; no fees/slippage)
export type Playbook = {
  id: string;
  label: string;
  riskPct: number;   // % of balance at risk per trade, e.g. 1.0
  atrMult: number;   // ATR multiple for stop distance, e.g. 1.5
  tps?: number[];    // RR targets (R units), e.g. [1,2,3]
};

export type RiskInput = {
  balance: number;       // account size in quote
  entry: number;         // planned entry price
  atr: number;           // ATR for TF
  playbook: Playbook;
};

export type RiskOutput = {
  stopPrice: number;
  riskPerUnit: number;   // entry - stop (long)
  sizeUnits: number;     // position size (units of token)
  riskAmount: number;    // absolute $ risk
  rrTargets: number[];   // target prices computed from R multiples
  rrList: number[];      // the R multiples used
  kellyLitePct: number;  // simple Kelly-lite % sizing suggestion (est.)
};

export function calcRisk({ balance, entry, atr, playbook }: RiskInput): RiskOutput {
  const riskAmount = (balance * (playbook.riskPct / 100));
  const stopPrice = Math.max(1e-12, entry - playbook.atrMult * atr);
  const riskPerUnit = Math.max(1e-12, entry - stopPrice);
  const sizeUnits = riskAmount / riskPerUnit;
  const rrList = (playbook.tps?.length ? playbook.tps : [1,2,3]);
  const rrTargets = rrList.map(R => entry + R * riskPerUnit);
  // Kelly-lite heuristics (assume edge ~ atr/entry capped)
  const edge = Math.min(0.2, Math.max(0, atr / Math.max(entry,1e-9))); // 0..20%
  const kellyLitePct = clamp((2*edge*100), 0.25, 4); // 0.25%..4%
  return { stopPrice, riskPerUnit, sizeUnits, riskAmount, rrTargets, rrList, kellyLitePct };
}

export const PLAYBOOKS: Playbook[] = [
  { id:"cons-1", label:"Conservative · 1% · ATR×1.5", riskPct:1.0, atrMult:1.5, tps:[1,2,3] },
  { id:"bal-15", label:"Balanced · 1.5% · ATR×2", riskPct:1.5, atrMult:2.0, tps:[1,2,3] },
  { id:"agg-2", label:"Aggressive · 2% · ATR×2.5", riskPct:2.0, atrMult:2.5, tps:[1,2,4] },
];

function clamp(x:number, lo:number, hi:number){ return Math.max(lo, Math.min(hi, x)); }

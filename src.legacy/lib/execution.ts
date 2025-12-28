// Execution Pack helpers - Build order text and TP ladders
import type { Idea } from "./ideas";

export type LadderConfig = {
  id: string;
  label: string;
  distribution: number[]; // % per TP level (must sum to ~100)
};

export const LADDERS: LadderConfig[] = [
  { id: "even-3", label: "Even 3×", distribution: [33.33, 33.33, 33.34] },
  { id: "scale-3", label: "Scale 3× (20/30/50)", distribution: [20, 30, 50] },
  { id: "scale-4", label: "Scale 4× (15/20/30/35)", distribution: [15, 20, 30, 35] },
];

export type LadderItem = {
  idx: number;
  target: string;
  units: string;
  pct: number;
};

export type Ladder = {
  config: LadderConfig;
  items: LadderItem[];
  totalUnits: number;
};

/**
 * Build order text for execution (exchange copy-paste friendly)
 */
export function buildOrderText(idea: Idea): string {
  const { side, address, risk } = idea;
  const entry = risk?.entryPrice ?? idea.entry ?? 0;
  const stop = risk?.stopPrice ?? idea.invalidation ?? 0;
  const size = risk?.sizeUnits ?? 0;
  
  const lines = [
    `${side.toUpperCase()} ${address.slice(0, 6)}...`,
    `Entry: ${entry > 0 ? entry.toFixed(8) : "MARKET"}`,
    `Stop: ${stop.toFixed(8)}`,
    `Size: ${size.toFixed(2)} units`,
  ];
  
  if (idea.targets && idea.targets.length > 0) {
    lines.push(`Targets: ${idea.targets.map(t => t.toFixed(8)).join(" / ")}`);
  } else if (risk?.rrTargets && risk.rrTargets.length > 0) {
    lines.push(`Targets: ${risk.rrTargets.map(t => t.toFixed(8)).join(" / ")}`);
  }
  
  return lines.join("\n");
}

/**
 * Build TP ladder with position size distribution
 */
export function buildLadder(idea: Idea, config: LadderConfig): Ladder {
  const totalUnits = idea.risk?.sizeUnits ?? 0;
  const targets = idea.risk?.rrTargets ?? idea.targets ?? [];
  
  // Use config distribution or split evenly if mismatch
  const dist = config.distribution.length === targets.length
    ? config.distribution
    : targets.map(() => 100 / targets.length);
  
  const items: LadderItem[] = targets.map((target, idx) => ({
    idx,
    target: target.toFixed(8),
    units: ((totalUnits * (dist[idx] ?? 0)) / 100).toFixed(2),
    pct: dist[idx] ?? 0,
  }));
  
  return { config, items, totalUnits };
}

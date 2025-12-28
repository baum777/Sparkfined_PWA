import React from "react";
import { cn } from "@/lib/ui/cn";
import type { DailyBias } from "@/api/marketIntelligence";
import "./daily-bias.css";

interface BiasTagProps {
  bias: DailyBias;
  className?: string;
}

const biasLabelMap: Record<DailyBias, string> = {
  BULLISH: "Bullish",
  BEARISH: "Bearish",
  NEUTRAL: "Neutral",
};

const biasVariantClass: Record<DailyBias, string> = {
  BULLISH: "sf-bias-tag--bullish",
  BEARISH: "sf-bias-tag--bearish",
  NEUTRAL: "sf-bias-tag--neutral",
};

export function BiasTag({ bias, className }: BiasTagProps) {
  const label = biasLabelMap[bias];

  return (
    <span className={cn("sf-bias-tag", biasVariantClass[bias], className)} aria-label={`${label} bias`}>
      <span className="sf-bias-tag__dot" aria-hidden />
      <span className="sf-bias-tag__text">{label}</span>
    </span>
  );
}

export default BiasTag;

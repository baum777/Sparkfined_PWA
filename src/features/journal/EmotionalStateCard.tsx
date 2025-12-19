import React, { useMemo, useState } from "react";
import { cn } from "@/lib/ui/cn";
import type { EmotionLabel } from "@/features/journal-v2/types";
import { EmojiSelector, type EmojiOption } from "./EmojiSelector";
import { GradientSlider } from "@/shared/components/GradientSlider";
import "./journal.css";

export interface EmotionalStateCardProps {
  emotion: EmotionLabel;
  onEmotionChange: (value: EmotionLabel) => void;
  confidence: number;
  onConfidenceChange: (value: number) => void;
  confidenceValueText?: string;
  conviction?: number;
  onConvictionChange?: (value: number) => void;
  patternQuality?: number;
  onPatternQualityChange?: (value: number) => void;
  options?: EmojiOption[];
  className?: string;
  showAdvancedDefault?: boolean;
}

function getConvictionLabel(value: number): string {
  if (value <= 3) return "Low";
  if (value <= 6) return "Medium";
  return "High";
}

function getPatternQualityLabel(value: number): string {
  if (value <= 3) return "Weak";
  if (value <= 6) return "OK";
  return "Strong";
}

export function EmotionalStateCard({
  emotion,
  onEmotionChange,
  confidence,
  onConfidenceChange,
  confidenceValueText,
  conviction,
  onConvictionChange,
  patternQuality,
  onPatternQualityChange,
  options,
  className,
  showAdvancedDefault = false,
}: EmotionalStateCardProps) {
  const [showAdvanced, setShowAdvanced] = useState(showAdvancedDefault);
  const convictionText = useMemo(
    () => (typeof conviction === "number" ? getConvictionLabel(conviction) : undefined),
    [conviction],
  );
  const patternQualityText = useMemo(
    () => (typeof patternQuality === "number" ? getPatternQualityLabel(patternQuality) : undefined),
    [patternQuality],
  );

  const hasAdvanced = Boolean(onConvictionChange || onPatternQualityChange);

  return (
    <section className={cn("sf-card sf-pad-4 sf-gap-4 sf-journal-emotion-card", className)}>
      <header className="sf-journal-emotion-card__header">
        <div>
          <p className="sf-journal-overline">Mindset</p>
          <h3 className="sf-journal-title">Emotional snapshot</h3>
          <p className="sf-journal-description">
            Pick the emoji that fits and slide to set your confidence for this trade.
          </p>
        </div>
        <div className="sf-journal-chip" aria-hidden="true">
          Live
        </div>
      </header>

      <EmojiSelector
        value={emotion}
        onChange={onEmotionChange}
        options={options}
        className="sf-journal-emotion-card__emoji"
        data-testid="journal-emoji-selector"
      />

      <GradientSlider
        label="Confidence"
        value={confidence}
        min={0}
        max={100}
        step={1}
        onChange={onConfidenceChange}
        helperText="0 = uneasy · 100 = conviction at peak"
        ariaLabel="Confidence level"
        ariaValueText={confidenceValueText ?? `${Math.round(confidence)} out of 100 confidence`}
        className="sf-journal-emotion-card__slider"
        data-testid="journal-confidence-slider"
      />

      {hasAdvanced ? (
        <div className="sf-journal-emotion-card__advanced">
          <button
            type="button"
            className="sf-journal-advanced-toggle"
            onClick={() => setShowAdvanced((open) => !open)}
            aria-expanded={showAdvanced}
          >
            <span>{showAdvanced ? "Hide" : "Show"} additional sliders</span>
            <span aria-hidden="true">▸</span>
          </button>

          {showAdvanced ? (
            <div className="sf-journal-emotion-card__advanced-grid">
              {onConvictionChange && typeof conviction === "number" ? (
                <GradientSlider
                  label="Conviction"
                  value={conviction}
                  min={0}
                  max={10}
                  step={1}
                  onChange={onConvictionChange}
                  helperText="How sure are you in this setup?"
                  ariaLabel="Trade conviction"
                  ariaValueText={`${convictionText ?? conviction} conviction out of 10`}
                  data-testid="journal-conviction-slider"
                />
              ) : null}

              {onPatternQualityChange && typeof patternQuality === "number" ? (
                <GradientSlider
                  label="Pattern quality"
                  value={patternQuality}
                  min={0}
                  max={10}
                  step={1}
                  onChange={onPatternQualityChange}
                  helperText="Signal cleanliness and structure"
                  ariaLabel="Pattern quality"
                  ariaValueText={`${patternQualityText ?? patternQuality} quality out of 10`}
                  data-testid="journal-pattern-slider"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

import React, { useEffect, useId, useRef, useState } from "react";
import type { EmotionLabel } from "@/features/journal-v2/types";
import { cn } from "@/lib/ui/cn";

export type EmojiOption = {
  value: EmotionLabel;
  label: string;
  emoji: string;
  description?: string;
};

const DEFAULT_OPTIONS: EmojiOption[] = [
  { value: "calm", label: "Calm", emoji: "😌", description: "Balanced and steady" },
  { value: "excitement", label: "Excited", emoji: "🤩", description: "Energized and ready" },
  { value: "fear", label: "Cautious", emoji: "😰", description: "Risk aware" },
  { value: "greed", label: "Greedy", emoji: "🤑", description: "Chasing upside" },
  { value: "overconfidence", label: "Confident", emoji: "😎", description: "Certain of the plan" },
];

export interface EmojiSelectorProps {
  value: EmotionLabel;
  onChange: (value: EmotionLabel) => void;
  options?: EmojiOption[];
  label?: string;
  className?: string;
  "data-testid"?: string;
}

export function EmojiSelector({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  label = "Emotional state",
  className,
  "data-testid": dataTestId,
}: EmojiSelectorProps) {
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      options.findIndex((option) => option.value === value),
    ),
  );

  useEffect(() => {
    const nextIndex = options.findIndex((option) => option.value === value);
    if (nextIndex >= 0) {
      setActiveIndex(nextIndex);
    }
  }, [options, value]);

  useEffect(() => {
    optionRefs.current = optionRefs.current.slice(0, options.length);
  }, [options.length]);

  const baseId = useId();
  const groupLabelId = `emoji-selector-label-${baseId}`;
  const descriptionId = `emoji-selector-description-${baseId}`;

  const handleArrowNavigation = (direction: 1 | -1) => {
    setActiveIndex((current) => {
      const nextIndex = (current + direction + options.length) % options.length;
      const nextValue = options[nextIndex]?.value;

      if (nextValue) {
        onChange(nextValue);
        optionRefs.current[nextIndex]?.focus();
      }

      return nextIndex;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      handleArrowNavigation(1);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      handleArrowNavigation(-1);
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      const nextValue = options[index]?.value;
      if (nextValue) {
        onChange(nextValue);
      }
    }
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={groupLabelId}
      aria-describedby={descriptionId}
      className={cn("sf-journal-emoji-selector", className)}
      data-testid={dataTestId}
    >
      <div className="sf-journal-emoji-selector__header">
        <p id={groupLabelId} className="sf-journal-emoji-selector__label">
          {label}
        </p>
        <p id={descriptionId} className="sf-journal-emoji-selector__description">
          Choose the emoji that best matches your mood.
        </p>
      </div>
      <div className="sf-journal-emoji-selector__options">
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const tabIndex = index === activeIndex ? 0 : -1;
          const ariaLabel = `${option.label} ${option.emoji}`;

          return (
            <button
              key={option.value}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={ariaLabel}
              className={cn("sf-journal-emoji-option", isSelected && "is-selected")}
              tabIndex={tabIndex}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span aria-hidden className="sf-journal-emoji-option__icon">
                {option.emoji}
              </span>
              <span className="sf-journal-emoji-option__text">
                <span className="sf-journal-emoji-option__label">{option.label}</span>
                {option.description ? (
                  <span className="sf-journal-emoji-option__description">{option.description}</span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

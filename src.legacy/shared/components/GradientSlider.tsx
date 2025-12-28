import React, { useId } from "react";
import { cn } from "@/lib/ui/cn";

export interface GradientSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  helperText?: string;
  ariaLabel?: string;
  ariaValueText?: string;
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function GradientSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  helperText,
  ariaLabel,
  ariaValueText,
  disabled = false,
  className,
  "data-testid": dataTestId,
}: GradientSliderProps) {
  const sliderId = useId();
  const labelId = `${sliderId}-label`;
  const helperId = helperText ? `${sliderId}-helper` : undefined;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    if (Number.isFinite(nextValue)) {
      onChange(nextValue);
    }
  };

  return (
    <div className={cn("sf-gradient-slider", className)}>
      <div className="sf-gradient-slider__header">
        <label id={labelId} className="sf-gradient-slider__label" htmlFor={sliderId}>
          {label}
        </label>
        <span className="sf-gradient-slider__value" aria-live="polite">
          {Math.round(value)}
        </span>
      </div>
      {helperText ? (
        <p id={helperId} className="sf-gradient-slider__helper">
          {helperText}
        </p>
      ) : null}
      <div className="sf-gradient-slider__track" aria-hidden="true">
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-labelledby={labelId}
          aria-describedby={helperId}
          aria-label={ariaLabel}
          aria-valuetext={ariaValueText}
          onChange={handleChange}
          className="sf-gradient-slider__input"
          disabled={disabled}
          data-testid={dataTestId}
        />
      </div>
    </div>
  );
}

import React from "react";
import { Input } from "@/components/ui";

const DEFAULT_SYMBOL_SUGGESTIONS = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "AVAXUSDT",
  "OPUSDT",
  "ARBUSDT",
  "DOGEUSDT",
  "ADAUSDT",
  "XRPUSDT",
];

type SymbolAutocompleteProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  suggestions?: string[];
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  required?: boolean;
  dataTestId?: string;
};

export function SymbolAutocomplete({
  id,
  value,
  onChange,
  label = "Symbol",
  placeholder = "BTCUSDT",
  suggestions = DEFAULT_SYMBOL_SUGGESTIONS,
  onBlur,
  onFocus,
  error,
  required,
  dataTestId,
}: SymbolAutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState<number | null>(null);
  const listId = React.useId();
  const blurTimeoutRef = React.useRef<number | null>(null);

  const filteredSuggestions = React.useMemo(() => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return suggestions;
    return suggestions.filter((item) => item.toLowerCase().includes(normalized));
  }, [suggestions, value]);

  React.useEffect(() => {
    if (!filteredSuggestions.length) {
      setHighlightedIndex(null);
      return;
    }
    setHighlightedIndex(0);
  }, [filteredSuggestions]);

  React.useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleSelect = (selection: string) => {
    onChange(selection);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredSuggestions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((previous) => {
        if (previous === null) return 0;
        return (previous + 1) % filteredSuggestions.length;
      });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((previous) => {
        if (previous === null) return filteredSuggestions.length - 1;
        return (previous - 1 + filteredSuggestions.length) % filteredSuggestions.length;
      });
    } else if (event.key === "Enter") {
      if (highlightedIndex !== null && isOpen) {
        event.preventDefault();
        const selection = filteredSuggestions[highlightedIndex];
        if (selection) {
          handleSelect(selection);
        }
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(null);
    }
  };

  const handleBlur = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 80);
    onBlur?.();
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current);
    }
    setIsOpen(true);
    onFocus?.();
  };

  const activeOptionId =
    highlightedIndex !== null ? `${listId}-option-${highlightedIndex}` : undefined;

  return (
    <div className="sf-alerts-autocomplete">
      <Input
        id={id}
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        aria-activedescendant={activeOptionId}
        aria-autocomplete="list"
        error={error}
        data-testid={dataTestId}
        required={required}
      />
      {isOpen && filteredSuggestions.length ? (
        <div
          id={listId}
          role="listbox"
          className="sf-alerts-autocomplete__list"
          data-testid="alert-symbol-autocomplete-list"
        >
          {filteredSuggestions.map((suggestion, index) => {
            const isHighlighted = highlightedIndex === index;
            return (
              <button
                key={suggestion}
                type="button"
                className={
                  isHighlighted
                    ? "sf-alerts-autocomplete__option sf-alerts-autocomplete__option--active"
                    : "sf-alerts-autocomplete__option"
                }
                role="option"
                id={`${listId}-option-${index}`}
                aria-selected={isHighlighted}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(suggestion)}
              >
                {suggestion}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default SymbolAutocomplete;

/**
 * TokenSearchAutocomplete Component
 *
 * Modern search autocomplete for cryptocurrency tokens following 2025 UX best practices.
 *
 * Features:
 * - 5-7 suggestions maximum (cognitive load optimization)
 * - <200ms perceived latency (150ms debounce + <50ms search)
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Bold highlighting of matching terms
 * - Touch-optimized (48px min-height)
 * - Loading states and performance monitoring
 *
 * Best Practices (2025):
 * - Baymard Institute: 5-8 suggestions optimal
 * - Nielsen Norman Group: Sub-200ms response time
 * - WCAG 2.1 AA: Full keyboard navigation + ARIA
 *
 * @example
 * ```tsx
 * <TokenSearchAutocomplete
 *   onSelect={(token) => console.log('Selected:', token)}
 *   placeholder="Search SOL, BTC, ETH..."
 * />
 * ```
 */

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { searchTokens } from '@/lib/tokenSearch';
import type { Token, TokenSearchResult } from '@/types/token';

interface TokenSearchAutocompleteProps {
  /** Callback when token is selected */
  onSelect: (token: Token) => void;

  /** Placeholder text */
  placeholder?: string;

  /** Maximum number of suggestions (default: 7) */
  maxSuggestions?: number;

  /** Debounce delay in ms (default: 150ms) */
  debounceMs?: number;

  /** Custom className */
  className?: string;

  /** Initial value */
  defaultValue?: string;
}

export default function TokenSearchAutocomplete({
  onSelect,
  placeholder = 'Search tokens (e.g., SOL, BTC)',
  maxSuggestions = 7,
  debounceMs = 150,
  className = '',
  defaultValue = '',
}: TokenSearchAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<TokenSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [performanceWarnings, setPerformanceWarnings] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, debounceMs);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      const startTime = performance.now();

      try {
        const results = await searchTokens(debouncedQuery, maxSuggestions);
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setSelectedIndex(-1);

        const endTime = performance.now();
        const totalLatency = endTime - startTime;

        // Monitor performance (target: <200ms total perceived latency)
        if (totalLatency > 200) {
          console.warn(`[TokenSearch] Slow autocomplete: ${totalLatency.toFixed(2)}ms`);
          setPerformanceWarnings((prev) => prev + 1);
        }
      } catch (error) {
        console.error('[TokenSearch] Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, maxSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && query.length >= 2) {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selectedToken = suggestions[selectedIndex];
          if (selectedToken) {
            handleSelect(selectedToken);
          }
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;

      default:
        break;
    }
  };

  const handleSelect = (token: Token) => {
    setQuery(token.symbol);
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect(token);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-500/20 text-yellow-400 font-semibold">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 2 && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full h-12 pl-11 pr-4 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all touch-manipulation"
          aria-label="Search tokens"
          aria-autocomplete="list"
          aria-controls="token-suggestions"
          aria-expanded={isOpen}
          aria-activedescendant={selectedIndex >= 0 ? `token-suggestion-${selectedIndex}` : undefined}
          autoComplete="off"
        />

        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        {/* Performance Warning (Dev Only) */}
        {performanceWarnings > 2 && process.env.NODE_ENV === 'development' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-amber-500">
            ⚠️ {performanceWarnings} slow searches
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          id="token-suggestions"
          role="listbox"
          className="absolute top-full mt-2 w-full rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden z-50 animate-slide-down"
        >
          {suggestions.map((token, index) => (
            <button
              key={token.address}
              id={`token-suggestion-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSelect(token)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`
                w-full px-4 py-3 text-left flex items-center gap-3
                transition-colors cursor-pointer touch-manipulation
                ${index === selectedIndex ? 'bg-zinc-800' : 'hover:bg-zinc-800'}
                ${index > 0 ? 'border-t border-zinc-800' : ''}
              `}
            >
              {/* Token Logo */}
              {token.logoURI && (
                <img
                  src={token.logoURI}
                  alt=""
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  loading="lazy"
                />
              )}

              {/* Token Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-zinc-100">
                  {highlightMatch(token.symbol, query)}
                  <span className="ml-2 text-xs text-zinc-500">
                    {highlightMatch(token.name, query)}
                  </span>
                </div>
                {token.tags && token.tags.length > 0 && (
                  <div className="text-xs text-zinc-400 mt-0.5 truncate">
                    {token.tags.slice(0, 2).join(', ')}
                  </div>
                )}
              </div>

              {/* Price Info */}
              <div className="text-right flex-shrink-0">
                <div className="font-mono text-sm text-zinc-100">
                  {formatPrice(token.price)}
                </div>
                <div
                  className={`text-xs font-medium ${
                    token.change24h > 0 ? 'text-emerald-400' : token.change24h < 0 ? 'text-rose-400' : 'text-zinc-400'
                  }`}
                >
                  {token.change24h > 0 ? '+' : ''}
                  {token.change24h.toFixed(2)}%
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && !isLoading && query.length >= 2 && suggestions.length === 0 && (
        <div className="absolute top-full mt-2 w-full rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl p-4 z-50">
          <p className="text-sm text-zinc-400 text-center">
            No tokens found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
}

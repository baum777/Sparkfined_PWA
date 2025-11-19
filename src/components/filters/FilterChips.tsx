/**
 * FilterChips Component
 *
 * Horizontal scrollable filter chips for trading interface.
 * Follows 2025 UX best practices with 16dp rounded corners and touch-optimized sizing.
 *
 * Best Practices (2025):
 * - Material Design 3: 16dp border-radius for chips
 * - iOS HIG: 44px minimum touch target
 * - Horizontal scroll for space efficiency on mobile
 * - Clear visual feedback for active/inactive states
 *
 * @example
 * ```tsx
 * <FilterChips
 *   chips={['Meme', 'DeFi', 'Top 100']}
 *   activeChips={['Meme']}
 *   onToggle={(chip) => console.log('Toggled:', chip)}
 * />
 * ```
 */

import { X } from 'lucide-react';

export interface FilterChip {
  /** Unique identifier */
  id: string;

  /** Display label */
  label: string;

  /** Chip count/badge (optional) */
  count?: number;

  /** Icon component (optional) */
  icon?: React.ReactNode;
}

interface FilterChipsProps {
  /** Array of filter chips */
  chips: FilterChip[];

  /** Active chip IDs */
  activeChips: string[];

  /** Callback when chip is toggled */
  onToggle: (chipId: string) => void;

  /** Layout mode */
  layout?: 'horizontal-scroll' | 'wrap';

  /** Show clear all button */
  showClearAll?: boolean;

  /** Callback when clear all is clicked */
  onClearAll?: () => void;

  /** Custom className */
  className?: string;
}

export default function FilterChips({
  chips,
  activeChips,
  onToggle,
  layout = 'horizontal-scroll',
  showClearAll = true,
  onClearAll,
  className = '',
}: FilterChipsProps) {
  const hasActiveFilters = activeChips.length > 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Chips Container */}
      <div
        className={`
          flex gap-2
          ${layout === 'horizontal-scroll' ? 'overflow-x-auto pb-2 scrollbar-hide' : 'flex-wrap'}
        `}
        style={{
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
          scrollbarWidth: 'none', // Hide scrollbar on Firefox
        }}
      >
        {chips.map((chip) => {
          const isActive = activeChips.includes(chip.id);

          return (
            <button
              key={chip.id}
              onClick={() => onToggle(chip.id)}
              className={`
                inline-flex items-center gap-2 px-4 h-11 whitespace-nowrap
                text-sm font-medium transition-all duration-200
                touch-manipulation active:scale-95
                ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100'
                }
              `}
              style={{ borderRadius: '16px' }} // 16dp Material Design 3 standard
              aria-pressed={isActive}
              aria-label={`Filter by ${chip.label}${chip.count ? ` (${chip.count} items)` : ''}`}
            >
              {/* Icon */}
              {chip.icon && <span className="flex-shrink-0">{chip.icon}</span>}

              {/* Label */}
              <span>{chip.label}</span>

              {/* Count Badge */}
              {chip.count !== undefined && (
                <span
                  className={`
                    ml-1 px-2 py-0.5 rounded-full text-xs font-semibold
                    ${isActive ? 'bg-blue-600' : 'bg-zinc-700'}
                  `}
                >
                  {chip.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Clear All Button */}
      {showClearAll && hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 h-11 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 text-sm font-medium transition-all duration-200 touch-manipulation active:scale-95"
          style={{ borderRadius: '16px' }}
          aria-label="Clear all filters"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      )}
    </div>
  );
}

// Simplified version for string-based chips (backward compatibility)
interface SimpleFilterChipsProps {
  chips: string[];
  activeChips: string[];
  onToggle: (chip: string) => void;
  layout?: 'horizontal-scroll' | 'wrap';
  showClearAll?: boolean;
  onClearAll?: () => void;
  className?: string;
}

export function SimpleFilterChips({
  chips,
  activeChips,
  onToggle,
  layout = 'horizontal-scroll',
  showClearAll = true,
  onClearAll,
  className = '',
}: SimpleFilterChipsProps) {
  const filterChips: FilterChip[] = chips.map((chip) => ({
    id: chip,
    label: chip,
  }));

  return (
    <FilterChips
      chips={filterChips}
      activeChips={activeChips}
      onToggle={onToggle}
      layout={layout}
      showClearAll={showClearAll}
      onClearAll={onClearAll}
      className={className}
    />
  );
}

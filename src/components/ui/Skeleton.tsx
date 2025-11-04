/**
 * Skeleton Component
 * 
 * Loading placeholder for content that's being fetched:
 * - Shimmer animation
 * - Customizable size
 * - Respects sharp/rounded layout preference
 * 
 * Usage:
 * - Text lines: <Skeleton className="h-4 w-full" />
 * - KPI Tile: <Skeleton className="h-24 w-full" />
 * - Feed Item: <Skeleton className="h-12 w-full" />
 */

interface SkeletonProps {
  className?: string;
  count?: number; // Render multiple skeletons
  animate?: boolean; // Default: true
}

export default function Skeleton({
  className = '',
  count = 1,
  animate = true,
}: SkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`bg-zinc-800/50 ${animate ? 'animate-pulse' : ''} ${className}`}
      style={{
        borderRadius: 'var(--radius-lg)',
      }}
      aria-hidden="true"
    />
  ));
  
  return count === 1 ? skeletons[0] : <>{skeletons}</>;
}

/**
 * Common Skeleton Patterns
 */

// KPI Tile Skeleton
export function KPITileSkeleton() {
  return (
    <div className="p-3">
      <Skeleton className="h-4 w-16 mb-2" /> {/* Label */}
      <Skeleton className="h-8 w-24 mb-1" /> {/* Value */}
      <Skeleton className="h-3 w-12" /> {/* Timestamp */}
    </div>
  );
}

// Feed Item Skeleton
export function FeedItemSkeleton() {
  return (
    <div className="flex items-start gap-3 px-3 py-2">
      <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" /> {/* Icon */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" /> {/* Text line 1 */}
        <Skeleton className="h-4 w-2/3" /> {/* Text line 2 */}
      </div>
      <Skeleton className="h-3 w-8" /> {/* Timestamp */}
    </div>
  );
}

// Quick Action Card Skeleton (Mobile)
export function QuickActionCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 p-4">
      <Skeleton className="h-12 w-12 rounded-full" /> {/* Icon */}
      <Skeleton className="h-3 w-16" /> {/* Label */}
    </div>
  );
}

/**
 * Usage Examples:
 * 
 * // Generic skeleton
 * <Skeleton className="h-20 w-full" />
 * 
 * // Multiple text lines
 * <Skeleton className="h-4 w-full" count={3} />
 * 
 * // KPI loading state
 * <div className="grid grid-cols-2 gap-3">
 *   {Array.from({ length: 4 }).map((_, i) => (
 *     <KPITileSkeleton key={i} />
 *   ))}
 * </div>
 * 
 * // Feed loading state
 * <div>
 *   {Array.from({ length: 5 }).map((_, i) => (
 *     <FeedItemSkeleton key={i} />
 *   ))}
 * </div>
 */

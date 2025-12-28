interface LoadingSkeletonProps {
  rows?: number
  className?: string
  type?: 'default' | 'analysis'
}

export default function LoadingSkeleton({ rows = 3, className = '', type = 'default' }: LoadingSkeletonProps) {
  if (type === 'analysis') {
    return (
      <div className="p-4 space-y-4 max-w-2xl mx-auto animate-fade-in" role="status" aria-label="Analyzing chart">
        {/* Chart Analysis Card Skeleton */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between animate-pulse">
            <div className="h-6 bg-surface rounded w-32" />
            <div className="h-4 bg-surface rounded w-20" />
          </div>
          
          {/* Metrics skeleton */}
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-border-subtle animate-pulse">
                <div className="h-4 bg-surface rounded w-24" />
                <div className="h-4 bg-surface rounded w-32" />
              </div>
            ))}
          </div>
          
          {/* Buttons skeleton */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="h-10 bg-surface rounded-lg animate-pulse" />
            <div className="h-10 bg-surface rounded-lg animate-pulse" />
          </div>
        </div>
        
        {/* Insights skeleton */}
        <div className="card border-accent/10 space-y-3">
          <div className="h-5 bg-surface rounded w-32 animate-pulse" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-4 h-4 bg-surface rounded mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface rounded w-full" />
                  <div className="h-4 bg-surface rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Loading text */}
        <div className="text-center text-sm text-text-tertiary animate-pulse">
          <p>🔍 Analyzing chart patterns...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`space-y-4 animate-pulse ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 bg-surface rounded w-3/4" />
          <div className="h-4 bg-surface rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}

import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export function Skeleton({ 
  variant = 'rectangular', 
  width, 
  height, 
  className = '',
  count = 1 
}: SkeletonProps) {
  const baseClasses = 'shimmer bg-surface-skeleton animate-pulse';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-2xl',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '3rem' : '4rem'),
  };
  
  if (count === 1) {
    return <div className={classes} style={style} />;
  }
  
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={classes} style={style} />
      ))}
    </div>
  );
}

// Preset Skeletons für häufige Use-Cases
export function SkeletonCard() {
  return (
    <div className="card p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="circular" width="3rem" height="3rem" />
        <Skeleton variant="text" width="4rem" />
      </div>
      <Skeleton variant="text" count={2} />
      <Skeleton variant="rectangular" height="2rem" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="circular" width="2.5rem" height="2.5rem" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="60%" />
          </div>
          <Skeleton variant="text" width="5rem" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="p-4 bg-surface rounded-xl border border-border">
          <div className="flex items-start gap-3">
            <Skeleton variant="circular" width="2rem" height="2rem" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="50%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChartCard() {
  return (
    <div className="card p-6 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="8rem" />
        <div className="flex gap-2">
          <Skeleton variant="rectangular" width="4rem" height="2rem" />
          <Skeleton variant="rectangular" width="4rem" height="2rem" />
        </div>
      </div>
      <Skeleton variant="rectangular" height="16rem" />
      <div className="flex gap-2">
        <Skeleton variant="text" width="5rem" />
        <Skeleton variant="text" width="5rem" />
        <Skeleton variant="text" width="5rem" />
      </div>
    </div>
  );
}

export function FeedItemSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-surface">
      <Skeleton variant="circular" width="2rem" height="2rem" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  );
}

export function KPITileSkeleton() {
  return (
    <div className="card p-6 rounded-2xl space-y-3">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" height="2rem" />
      <Skeleton variant="text" width="30%" />
    </div>
  );
}

import React from 'react';
import StateView from './StateView';

export type CalmStateType = 'loading' | 'empty' | 'error' | 'offline';

interface CalmStateProps {
  type: CalmStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  compact?: boolean;
}

export function CalmState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  className,
  compact,
}: CalmStateProps) {
  return (
    <div className={`card-glass rounded-2xl border border-border/70 ${className ?? ''}`}>
      <StateView
        type={type}
        title={title}
        description={description}
        actionLabel={actionLabel}
        onAction={onAction}
        compact={compact}
      />
    </div>
  );
}

export default CalmState;

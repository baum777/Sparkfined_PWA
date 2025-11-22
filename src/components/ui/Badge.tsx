import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full border border-success/20',
  warning: 'px-2 py-0.5 bg-warn/10 text-warn text-xs font-medium rounded-full border border-warn/20',
  error: 'px-2 py-0.5 bg-danger/10 text-danger text-xs font-medium rounded-full border border-danger/20',
  info: 'px-2 py-0.5 bg-info/10 text-info text-xs font-medium rounded-full border border-info/20',
  neutral: 'px-2 py-0.5 bg-surface text-text-secondary text-xs font-medium rounded-full border border-border',
};

export function Badge({
  variant = 'neutral',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span className={`inline-flex items-center ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;

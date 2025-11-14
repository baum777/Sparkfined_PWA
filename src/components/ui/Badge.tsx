import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'px-2 py-0.5 bg-green-500/10 text-green-500 text-xs font-medium rounded-full border border-green-500/20',
  warning: 'px-2 py-0.5 bg-amber-500/10 text-amber-500 text-xs font-medium rounded-full border border-amber-500/20',
  error: 'px-2 py-0.5 bg-red-500/10 text-red-500 text-xs font-medium rounded-full border border-red-500/20',
  info: 'px-2 py-0.5 bg-cyan-500/10 text-cyan-500 text-xs font-medium rounded-full border border-cyan-500/20',
  neutral: 'px-2 py-0.5 bg-zinc-800 text-zinc-300 text-xs font-medium rounded-full border border-zinc-700',
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

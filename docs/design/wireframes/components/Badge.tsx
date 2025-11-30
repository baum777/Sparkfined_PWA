import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'px-2 py-0.5 bg-green-500/10 text-green-500 text-xs font-medium rounded-full',
  warning: 'px-2 py-0.5 bg-amber-500/10 text-amber-500 text-xs font-medium rounded-full',
  error: 'px-2 py-0.5 bg-red-500/10 text-red-500 text-xs font-medium rounded-full',
  info: 'px-2 py-0.5 bg-cyan-500/10 text-cyan-500 text-xs font-medium rounded-full',
  neutral: 'px-2 py-0.5 bg-neutral-800 text-neutral-300 text-xs font-medium rounded-full',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
}) => {
  return (
    <span className={`${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

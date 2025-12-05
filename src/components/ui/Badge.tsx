/**
 * Badge - Migrated to Design System
 *
 * Uses Design System tokens (already using sentiment colors, now with better styling)
 */
import React from 'react'
import { cn } from '@/lib/ui/cn'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'brand'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  live?: boolean // Add live pulse effect
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-subtle text-text-secondary border-border-moderate',
  success: 'bg-sentiment-bull-bg text-sentiment-bull border-sentiment-bull-border',
  warning: 'bg-sentiment-neutral-bg text-amber-200 border-sentiment-neutral-border',
  danger: 'bg-sentiment-bear-bg text-sentiment-bear border-sentiment-bear-border',
  outline: 'bg-transparent text-text-secondary border-border-moderate',
  brand: 'bg-brand/10 text-brand border-brand/30',
}

export function Badge({ variant = 'default', live = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-all',
        variantClasses[variant],
        live && 'pulse-live', // Design System live animation
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge

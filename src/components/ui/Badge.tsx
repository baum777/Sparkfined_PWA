// TODO: design-system: candidate for migration once core DS is in place (Codex step 2+)
// This is a V1 component using emerald theme. Will be replaced/shimmed with src/design-system/components/Badge
import React from 'react'
import { cn } from '@/lib/ui/cn'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'outline'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-subtle text-text-secondary border-border-moderate',
  success: 'bg-sentiment-bull-bg text-sentiment-bull border-sentiment-bull-border',
  warning: 'bg-sentiment-neutral-bg text-amber-200 border-sentiment-neutral-border',
  danger: 'bg-sentiment-bear-bg text-sentiment-bear border-sentiment-bear-border',
  outline: 'bg-transparent text-text-secondary border-border-moderate',
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge

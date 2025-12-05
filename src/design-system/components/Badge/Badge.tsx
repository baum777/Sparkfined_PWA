import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/design-system/utils/cn'

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'warning'
  | 'danger'
  | 'success'
  | 'muted'
  | 'armed'
  | 'triggered'
  | 'paused'
export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  pulsing?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-smoke-light/60 text-text-secondary border-smoke-light/80',
  secondary: 'bg-smoke text-text-secondary border-smoke-light/80',
  outline: 'bg-transparent text-text-primary border-smoke-light',
  warning: 'bg-gold/15 text-gold border-gold/40',
  danger: 'bg-blood/10 text-blood border-blood/40',
  success: 'bg-phosphor/15 text-phosphor border-phosphor/40',
  muted: 'bg-smoke/70 text-text-secondary border-smoke-light/80',
  armed: 'bg-spark/15 text-spark border-spark/40',
  triggered: 'bg-gold/15 text-gold border-gold/40',
  paused: 'bg-smoke/70 text-text-secondary border-smoke-light/80',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'h-5 px-2 text-[10px]',
  md: 'h-6 px-2.5 text-xs',
  lg: 'h-7 px-3 text-sm',
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'default', size = 'md', pulsing = false, className, children, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-semibold uppercase tracking-wider',
        'transition-colors duration-200',
        variantStyles[variant],
        sizeStyles[size],
        pulsing && 'animate-pulse',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
})

Badge.displayName = 'Badge'

// TODO: design-system: candidate for migration once core DS is in place (Codex step 2+)
// This is a V1 component using emerald theme. Will be replaced/shimmed with src/design-system/components/Button
import React from 'react'
import { Loader2 } from '@/lib/icons'
import { cn } from '@/lib/ui/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  loading?: boolean // Backward compatibility alias
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

/**
 * Button
 *
 * Usage:
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleSave}>
 *   Save changes
 * </Button>
 *
 * <Button variant="ghost" size="sm" aria-label="Open settings">
 *   <SettingsIcon />
 * </Button>
 * ```
 */

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white shadow-glow-accent hover:bg-brand-hover focus-visible:ring-brand/60',
  secondary:
    'bg-surface-subtle text-text-primary border border-border-moderate hover:bg-surface-hover focus-visible:ring-border-focus',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-subtle focus-visible:ring-border-focus/50',
  outline:
    'bg-transparent text-text-primary border border-border-moderate hover:border-border-hover hover:bg-surface-subtle focus-visible:ring-border-focus',
  destructive:
    'bg-danger text-white border border-danger hover:bg-danger/90 focus-visible:ring-danger/60',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false, // Backward compatibility
  leftIcon,
  rightIcon,
  disabled,
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const isLoadingState = isLoading || loading

  return (
    <button
      type={type}
      disabled={disabled || isLoadingState}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {isLoadingState ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          <span>{children}</span>
        </span>
      ) : (
        <>
          {leftIcon ? <span className="flex-shrink-0">{leftIcon}</span> : null}
          <span>{children}</span>
          {rightIcon ? <span className="flex-shrink-0">{rightIcon}</span> : null}
        </>
      )}
    </button>
  )
}

/**
 * Button - Migrated to Design System
 *
 * Uses Design System button classes (.btn, .btn-primary, etc.) from src/styles/index.css
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

// Map component variants to Design System button classes
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  destructive: 'btn-danger',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '', // Default size
  lg: 'btn-lg',
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
        'btn', // Base Design System button class
        variantClasses[variant],
        sizeClasses[size],
        isLoadingState && 'shimmer', // Design System loading animation
        disabled && 'btn-disabled',
        className
      )}
      {...props}
    >
      {isLoadingState ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          <span>{children}</span>
        </>
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

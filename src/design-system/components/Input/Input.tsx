import React, { forwardRef, useId, type ReactNode } from 'react'
import { cn } from '@/design-system/utils/cn'

export type InputVariant = 'default' | 'error'
export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode
  helperText?: ReactNode
  errorText?: ReactNode
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  variant?: InputVariant
  size?: InputSize
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-9 rounded-md px-3 text-sm',
  md: 'h-11 rounded-lg px-4 text-sm',
  lg: 'h-12 rounded-xl px-5 text-base',
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helperText,
    errorText,
    leftIcon,
    rightIcon,
    id,
    variant = errorText ? 'error' : 'default',
    size = 'md',
    className,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const helperId = helperText ? `${inputId}-helper` : undefined
  const errorId = errorText ? `${inputId}-error` : undefined
  const hasError = variant === 'error'

  return (
    <div className="w-full space-y-1.5 text-left">
      {label ? (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-tertiary">{leftIcon}</span>
        ) : null}

        <input
          id={inputId}
          ref={ref}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : helperId}
          className={cn(
            'w-full border bg-smoke-light/70 text-sm text-text-primary placeholder:text-text-tertiary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark focus-visible:ring-offset-2 focus-visible:ring-offset-void',
            sizeStyles[size],
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            hasError
              ? 'border-blood focus-visible:ring-blood/60'
              : 'border-smoke-light focus-visible:ring-spark/40',
            className
          )}
          {...props}
        />

        {rightIcon ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-tertiary">{rightIcon}</span>
        ) : null}
      </div>

      {hasError ? (
        <p id={errorId} role="alert" className="flex items-center gap-2 text-xs text-blood">
          <span className="h-1.5 w-1.5 rounded-full bg-blood" aria-hidden />
          {errorText}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-text-secondary">
          {helperText}
        </p>
      ) : null}
    </div>
  )
})

Input.displayName = 'Input'

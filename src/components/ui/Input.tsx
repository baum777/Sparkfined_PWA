// TODO: design-system: candidate for migration once core DS is in place (Codex step 2+)
// This is a V1 component using emerald theme. Will be replaced/shimmed with src/design-system/components/Input
import React from 'react'
import { cn } from '@/lib/ui/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  hint?: string // Backward compatibility alias for helperText
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  mono?: boolean
  errorId?: string
  errorTestId?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    hint,
    leftIcon,
    rightIcon,
    mono = false,
    errorId,
  errorTestId,
    className,
    id,
    ...props
  },
  ref
) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const helperTextValue = helperText ?? hint
  const computedErrorId = error ? errorId ?? `${inputId}-error` : undefined
  const helperId = !error && helperTextValue ? `${inputId}-helper` : undefined

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-text-secondary">
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
          aria-invalid={Boolean(error)}
          aria-describedby={computedErrorId ?? helperId}
          className={cn(
            'h-12 w-full rounded-xl border bg-surface-subtle px-4 text-sm text-text-primary placeholder:text-text-tertiary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
            error ? 'border-danger focus-visible:ring-danger/40' : 'border-border-moderate focus-visible:ring-border-focus',
            leftIcon && 'pl-11',
            rightIcon && 'pr-11',
            mono && 'font-mono tabular-nums',
            className
          )}
          {...props}
        />

        {rightIcon ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-tertiary">{rightIcon}</span>
        ) : null}
      </div>

      {error ? (
        <p
          id={computedErrorId}
          className="mt-1 flex items-center gap-1 text-xs text-danger"
          role="alert"
          data-testid={errorTestId}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-danger" aria-hidden />
          {error}
        </p>
      ) : null}

      {!error && helperTextValue ? (
        <p id={helperId} className="mt-1 text-xs text-text-tertiary">
          {helperTextValue}
        </p>
      ) : null}
    </div>
  )
})

export default Input

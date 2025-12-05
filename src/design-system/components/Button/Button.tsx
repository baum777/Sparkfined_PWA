import { forwardRef } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps, MotionProps } from 'framer-motion'
import { cn } from '@/design-system/utils/cn'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'outline'
  | 'destructive'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

type MotionButtonBase = Omit<HTMLMotionProps<'button'>, 'size' | 'children'>

export interface ButtonProps extends MotionButtonBase {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  /** @deprecated Legacy alias maintained for backward compatibility */
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-spark text-void border border-spark/30 shadow-glow-spark hover:shadow-glow-spark focus-visible:ring-spark',
  secondary:
    'bg-smoke text-mist border border-smoke-light hover:border-spark/60 hover:text-spark focus-visible:ring-spark/40',
  ghost:
    'bg-transparent text-mist border border-transparent hover:bg-smoke/40 hover:text-spark focus-visible:ring-spark/40',
  danger:
    'bg-blood text-mist border border-blood/40 shadow-glow-blood hover:shadow-glow-blood focus-visible:ring-blood/70',
  success:
    'bg-phosphor text-void border border-phosphor/40 shadow-glow-phosphor hover:shadow-glow-phosphor focus-visible:ring-phosphor/60',
  outline:
    'bg-transparent text-spark border border-spark hover:bg-spark/10 shadow-glow-spark focus-visible:ring-spark/40',
  destructive:
    'bg-blood text-mist border border-blood/40 shadow-glow-blood hover:shadow-glow-blood focus-visible:ring-blood/70',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-[2.25rem] px-3 text-xs rounded-md',
  md: 'min-h-[2.75rem] px-4 text-sm rounded-lg',
  lg: 'min-h-[3.25rem] px-5 text-base rounded-xl',
  xl: 'min-h-[3.75rem] px-6 text-lg rounded-2xl',
}

const motionProps: MotionProps = {
  whileHover: { scale: 1.04 },
  whileTap: { scale: 0.97 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
}

function Spinner() {
  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-flex h-4 w-4 animate-spin items-center justify-center rounded-full border-2 border-current border-b-transparent"
    />
  )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loading,
    leftIcon,
    rightIcon,
    disabled,
    className,
    children,
    type = 'button',
    ...props
  },
  ref
) {
  const pending = isLoading || Boolean(loading)
  const resolvedVariant = variant === 'destructive' ? 'danger' : variant

  return (
    <motion.button
      {...motionProps}
      ref={ref}
      type={type}
      disabled={disabled || pending}
      aria-busy={pending}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 font-medium tracking-wide transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:pointer-events-none disabled:opacity-60',
        variantStyles[resolvedVariant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2" data-slot="button-loader">
          <Spinner />
          {children && <span className="text-xs font-medium normal-case tracking-normal">{children}</span>}
        </span>
      ) : (
        <>
          {leftIcon ? <span className="flex-shrink-0" data-slot="button-icon-start">{leftIcon}</span> : null}
          <span>{children}</span>
          {rightIcon ? <span className="flex-shrink-0" data-slot="button-icon-end">{rightIcon}</span> : null}
        </>
      )}
    </motion.button>
  )
})

Button.displayName = 'Button'

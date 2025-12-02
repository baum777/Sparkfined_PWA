import React from 'react'
import { cn } from '@/lib/ui/cn'

interface ResponsiveTableProps {
  children: React.ReactNode
  /**
   * Optional additional classes for the outer scroll container.
   */
  className?: string
  /**
   * Additional classes applied to the inner content wrapper.
   */
  innerClassName?: string
}

/**
 * ResponsiveTable provides a horizontal scroll wrapper for tabular layouts.
 * Mobile: stacked cards or flex layouts can live inside without restriction.
 * >= sm: adds subtle edge fades and prevents layout overflow by enabling inertial scrolling.
 */
export function ResponsiveTable({ children, className, innerClassName }: ResponsiveTableProps) {
  return (
    <div
      className={cn(
        'relative -mx-2 overflow-x-auto overscroll-x-contain px-2 py-1 sm:-mx-3 sm:px-3',
        className
      )}
    >
      <div className={cn('min-w-full sm:min-w-[640px]', innerClassName)}>{children}</div>
      <div
        className="pointer-events-none absolute inset-y-1 right-0 hidden w-6 bg-gradient-to-l from-bg to-transparent sm:block"
        aria-hidden="true"
      />
    </div>
  )
}

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/design-system/utils'

export type ModalSize = 'sm' | 'md' | 'lg' | 'full'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  size?: ModalSize
  closeOnOverlayClick?: boolean
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  full: 'max-w-[95vw]',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
}: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return
    const previousActive = document.activeElement as HTMLElement | null
    const body = document.body
    body.style.setProperty('overflow', 'hidden')

    const timer = window.setTimeout(() => {
      containerRef.current?.focus()
    }, 0)

    return () => {
      window.clearTimeout(timer)
      body.style.removeProperty('overflow')
      previousActive?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [isOpen, onClose])

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="modal-backdrop"
            data-testid="ds-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-void/80 backdrop-blur-sm"
            onClick={() => {
              if (closeOnOverlayClick) onClose()
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="modal-content"
              data-testid="ds-modal"
              ref={containerRef}
              tabIndex={-1}
              initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
              transition={
                prefersReducedMotion ? undefined : { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
              }
              className={cn(
                'w-full rounded-xl border border-smoke-light bg-smoke p-6 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark',
                sizeClasses[size]
              )}
              role="dialog"
              aria-modal="true"
            >
              {(title || description) && (
                <header className="mb-4 space-y-2">
                  {title ? (
                    <h2 className="text-2xl font-bold text-mist font-display">{title}</h2>
                  ) : null}
                  {description ? <p className="text-sm text-fog">{description}</p> : null}
                </header>
              )}
              <div>{children}</div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}

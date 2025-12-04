import { useEffect, useId, type HTMLAttributes, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/design-system/utils/cn'
import { useFocusTrap } from '@/hooks/useFocusTrap'

export type ModalSize = 'sm' | 'md' | 'lg' | 'full'

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  full: 'max-w-[95vw]',
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  size?: ModalSize
  initialFocusRef?: RefObject<HTMLElement | null>
  closeOnOverlayClick?: boolean
}

const overlayTransition = { duration: 0.2, ease: [0.16, 1, 0.3, 1] }

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  initialFocusRef,
  closeOnOverlayClick = true,
}: ModalProps) {
  const prefersReducedMotion = useReducedMotion()
  const modalId = useId()
  const descriptionId = useId()
  const focusTrapRef = useFocusTrap<HTMLDivElement>({ isActive: isOpen, initialFocusRef, onEscape: onClose })
  const isBrowser = typeof document !== 'undefined'

  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isBrowser) return null

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="modal-overlay"
            data-testid="modal-backdrop"
            className="fixed inset-0 z-[1300] bg-void/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
            onClick={closeOnOverlayClick ? onClose : undefined}
          />
          <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4">
            <motion.div
              key="modal-content"
              ref={focusTrapRef}
              data-testid="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? modalId : undefined}
              aria-describedby={description ? descriptionId : undefined}
              className={cn(
                'w-full rounded-xl border border-smoke-light bg-smoke p-6 shadow-xl shadow-void/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark',
                sizeStyles[size]
              )}
              initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
              transition={{ duration: 0.3, ease: prefersReducedMotion ? 'linear' : [0.34, 1.56, 0.64, 1] }}
            >
              {(title || description) && (
                <div className="mb-4">
                  {title ? (
                    <h2 id={modalId} className="font-display text-2xl font-bold text-mist">
                      {title}
                    </h2>
                  ) : null}
                  {description ? (
                    <p id={descriptionId} className="mt-2 text-sm text-fog">
                      {description}
                    </p>
                  ) : null}
                </div>
              )}
              {children}
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}

export function ModalHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4', className)} {...props} />
}

export function ModalBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-mist', className)} {...props} />
}

export function ModalFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-6 flex flex-wrap items-center justify-end gap-3', className)} {...props} />
}

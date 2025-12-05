import { useEffect, useId } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { cn } from '@/design-system/utils/cn'
import { useFocusTrap } from '@/hooks/useFocusTrap'

export type ModalSize = 'sm' | 'md' | 'lg' | 'full'

type MotionDivProps = Omit<HTMLMotionProps<'div'>, 'title' | 'children'>

export interface ModalProps extends MotionDivProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  size?: ModalSize
  portalId?: string
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  full: 'max-w-[95vw] min-h-[85vh]',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  className,
  children,
  portalId,
  ...props
}: ModalProps) {
  if (typeof document === 'undefined') {
    return null
  }

  const portalRoot = portalId ? document.getElementById(portalId) : document.body
  const labelId = useId()
  const descriptionId = description ? `${labelId}-description` : undefined
  const containerRef = useFocusTrap<HTMLDivElement>({ isActive: isOpen, onEscape: onClose })

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!portalRoot) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="modal-backdrop"
            data-testid="modal-backdrop"
            className="fixed inset-0 z-50 bg-void/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="modal-content"
              ref={containerRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? labelId : undefined}
              aria-describedby={descriptionId}
              className={cn(
                'w-full rounded-xl border border-smoke-light bg-smoke p-6 shadow-xl shadow-void/50',
                sizeStyles[size],
                className
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
              {...props}
            >
              {(title || description) && (
                <header className="mb-4">
                  {title && (
                    <h2 id={labelId} className="font-display text-2xl font-semibold text-mist">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id={descriptionId} className="mt-2 text-sm text-mist-fog">
                      {description}
                    </p>
                  )}
                </header>
              )}
              <div>{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    portalRoot
  )
}

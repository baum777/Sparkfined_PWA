import React from "react"
import { createPortal } from "react-dom"
import { X } from "@/lib/icons"
import { cn } from "@/lib/ui/cn"
import { useFocusTrap } from "@/lib/ui/useFocusTrap"

type SheetWidth = "sm" | "md" | "lg"

const widthClasses: Record<SheetWidth, string> = {
  sm: "w-full sm:w-[360px]",
  md: "w-full sm:w-[420px]",
  lg: "w-full sm:w-[480px]",
}

export interface RightSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: SheetWidth
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
  'data-testid'?: string
}

const getOverlayRoot = () => document.getElementById("overlay-root") ?? document.body

export function RightSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  'data-testid': testId,
}: RightSheetProps) {
  const sheetRef = React.useRef<HTMLDivElement>(null)
  const closeButtonRef = React.useRef<HTMLButtonElement>(null)
  const titleId = React.useId()

  useFocusTrap(sheetRef, isOpen, { initialFocus: closeButtonRef })

  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation()
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, closeOnEscape, onClose])

  React.useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-stretch justify-end bg-bg-overlay/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      data-testid="right-sheet-overlay"
      onMouseDown={handleOverlayClick}
    >
      <div
        ref={sheetRef}
        className={cn(
          "relative flex h-screen max-h-screen flex-col border-l border-border bg-surface-elevated shadow-2xl",
          "animate-slide-in-right",
          widthClasses[width],
          className
        )}
        tabIndex={-1}
        data-testid={testId ?? "right-sheet-content"}
      >
        {(title || subtitle) && (
          <header className="flex flex-shrink-0 items-start justify-between border-b border-border px-6 py-5">
            <div className="flex-1">
              {title && (
                <h2 id={titleId} className="text-lg font-semibold text-text-primary">
                  {title}
                </h2>
              )}
              {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="ml-4 rounded-full p-2 text-text-secondary transition-all hover:bg-interactive-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              aria-label="Close panel"
              data-testid="right-sheet-close-button"
            >
              <X size={20} />
            </button>
          </header>
        )}

        {/* 
          Important: `min-h-0` is required so the scroll area can shrink inside the
          flex column. Without it, tall content can push the footer out of the
          viewport (Playwright then reports footer buttons as "outside of the viewport").
          
          The footer is sticky at the bottom of the scroll container, ensuring it's
          always visible and accessible (critical for Playwright tests at 1280x720).
        */}
        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <div className="px-6 py-5 text-text-primary">
            {children}
          </div>
          {footer ? (
            <div className="sticky bottom-0 border-t border-border bg-surface-elevated px-6 py-4 backdrop-blur">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    getOverlayRoot()
  )
}

export function RightSheetSection({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <section className={cn("space-y-3", className)} {...props} />
}

export function RightSheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-wrap items-center justify-end gap-3", className)} {...props} />
}

export default RightSheet

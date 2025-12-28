import React from "react"
import { createPortal } from "react-dom"
import { X } from "@/lib/icons"
import { cn } from "@/lib/ui/cn"
import { useFocusTrap } from "@/lib/ui/useFocusTrap"

type BottomSheetSize = "sm" | "md" | "lg"

const maxHeightClasses: Record<BottomSheetSize, string> = {
  sm: "max-h-[65vh]",
  md: "max-h-[72vh]",
  lg: "max-h-[80vh]",
}

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: BottomSheetSize
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
  "data-testid"?: string
}

const getOverlayRoot = () => document.getElementById("overlay-root") ?? document.body

export function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  "data-testid": testId,
}: BottomSheetProps) {
  const sheetRef = React.useRef<HTMLDivElement>(null)
  const handleRef = React.useRef<HTMLButtonElement>(null)
  const titleId = React.useId()

  useFocusTrap(sheetRef, isOpen, { initialFocus: handleRef })

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
      className="fixed inset-0 z-modal flex items-end bg-bg-overlay/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      data-testid="bottom-sheet-overlay"
      onMouseDown={handleOverlayClick}
    >
      <div
        ref={sheetRef}
        className={cn(
          "relative w-full overflow-hidden rounded-t-3xl border border-border bg-surface-elevated shadow-2xl",
          "animate-slide-in-up",
          maxHeightClasses[size],
          className,
        )}
        tabIndex={-1}
        data-testid={testId ?? "bottom-sheet-content"}
      >
        <div className="flex items-center justify-center px-6 pt-3">
          <button
            ref={handleRef}
            type="button"
            onClick={onClose}
            className="flex h-12 w-full flex-col items-center justify-center gap-2 rounded-t-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            aria-label="Close sheet"
            data-testid="bottom-sheet-handle"
          >
            <span className="inline-flex h-1 w-12 rounded-full bg-border" aria-hidden />
            <span className="text-xs font-medium text-text-secondary">Drag or tap to close</span>
          </button>
        </div>

        {(title || subtitle) && (
          <header className="flex items-start justify-between gap-3 px-6 pb-3">
            <div className="flex-1">
              {title ? (
                <h2 id={titleId} className="text-lg font-semibold text-text-primary">
                  {title}
                </h2>
              ) : null}
              {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-text-secondary transition hover:bg-interactive-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              aria-label="Close sheet"
            >
              <X size={20} />
            </button>
          </header>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 text-text-primary">
          {children}
          {footer ? <div className="mt-4 border-t border-border pt-4">{footer}</div> : null}
        </div>
      </div>
    </div>,
    getOverlayRoot(),
  )
}

export default BottomSheet

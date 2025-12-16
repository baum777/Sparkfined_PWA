/**
 * Modal Component - Reusable Modal/Dialog with Layer System
 *
 * Features:
 * - z-modal (z-index: 30) from Layer System
 * - Focus trap support
 * - Escape key handling
 * - Click outside to close
 * - Accessible (role="dialog", aria-modal)
 *
 * Usage:
 * ```tsx
 * <Modal isOpen={isOpen} onClose={handleClose} title="Delete Alert?">
 *   <p>This action cannot be undone.</p>
 *   <div className="flex gap-3 mt-4">
 *     <Button variant="secondary" onClick={handleClose}>Cancel</Button>
 *     <Button variant="destructive" onClick={handleDelete}>Delete</Button>
 *   </div>
 * </Modal>
 * ```
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { X } from '@/lib/icons';
import { cn } from '@/lib/ui/cn';
import { useFocusTrap } from '@/lib/ui/useFocusTrap';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  className,
}: ModalProps) {
  const titleId = React.useId();
  const contentRef = React.useRef<HTMLDivElement>(null);

  useFocusTrap(contentRef, isOpen);

  // Handle Escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const portalTarget = document.getElementById('overlay-root') ?? document.body;

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-center justify-center bg-bg-overlay/80 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      onMouseDown={handleOverlayClick}
      data-testid="modal-overlay"
    >
      <div
        ref={contentRef}
        className={cn(
          'w-full rounded-2xl border border-border-moderate bg-surface-elevated p-6 shadow-2xl',
          'animate-scale-in',
          sizeClasses[size],
          className
        )}
        tabIndex={-1}
        data-testid="modal-content"
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <header className={cn('flex items-start justify-between', children && 'mb-5')}>
            <div className="flex-1">
              {title && (
                <h2 id={titleId} className="text-xl font-semibold text-text-primary">
                  {title}
                </h2>
              )}
              {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="ml-4 rounded-full p-2 text-text-secondary transition-all hover:bg-interactive-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                aria-label="Close modal"
                data-testid="modal-close-button"
              >
                <X size={20} />
              </button>
            )}
          </header>
        )}

        {/* Body */}
        <div className="text-text-primary">{children}</div>
      </div>
    </div>,
    portalTarget
  );
}

export default Modal;

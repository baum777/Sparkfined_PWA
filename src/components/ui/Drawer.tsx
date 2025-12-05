/**
 * Drawer Component - Side Drawer for Forms & Editors
 *
 * Features:
 * - z-drawer (z-index: 20) from Layer System
 * - Slides in from right (or left)
 * - Darkens main content when open
 * - Escape key handling
 * - Click outside to close
 * - Accessible (role="dialog", aria-modal)
 *
 * Usage:
 * ```tsx
 * <Drawer isOpen={isOpen} onClose={handleClose} title="New Alert">
 *   <DrawerSection title="Market Selection">
 *     <Input label="Symbol" />
 *   </DrawerSection>
 *   <DrawerActions>
 *     <Button variant="secondary" onClick={handleClose}>Cancel</Button>
 *     <Button variant="primary" onClick={handleSave}>Create Alert</Button>
 *   </DrawerActions>
 * </Drawer>
 * ```
 */

import React from 'react';
import { X } from '@/lib/icons';
import { cn } from '@/lib/ui/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const widthClasses = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[480px]',
};

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  position = 'right',
  width = 'md',
  showCloseButton = true,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  className,
}: DrawerProps) {
  const titleId = React.useId();

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

  // Lock body scroll when drawer is open
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

  const slideDirection = position === 'left' ? 'slide-in-left' : 'slide-in-right';

  return (
    <div
      className="fixed inset-0 z-drawer flex bg-bg-overlay/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      onMouseDown={handleOverlayClick}
      data-testid="drawer-overlay"
    >
      <div
        className={cn(
          'flex h-full flex-col border-border bg-surface-elevated shadow-2xl',
          'ml-auto',
          position === 'left' ? 'border-r' : 'border-l',
          position === 'left' ? 'mr-auto ml-0' : '',
          widthClasses[width],
          `animate-${slideDirection}`,
          className
        )}
        data-testid="drawer-content"
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <header className="flex flex-shrink-0 items-start justify-between border-b border-border px-6 py-5">
            <div className="flex-1">
              {title && (
                <>
                  <p className="text-xs uppercase tracking-wide text-text-tertiary">Sparkfined</p>
                  <h2 id={titleId} className="mt-1 text-xl font-semibold text-text-primary">
                    {title}
                  </h2>
                </>
              )}
              {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="ml-4 rounded-full p-2 text-text-secondary transition-all hover:bg-interactive-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                aria-label="Close drawer"
                data-testid="drawer-close-button"
              >
                <X size={20} />
              </button>
            )}
          </header>
        )}

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 text-text-primary">{children}</div>
      </div>
    </div>
  );
}

/** DrawerSection - Grouped content section in Drawer */
export interface DrawerSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function DrawerSection({ title, description, children, className }: DrawerSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description) && (
        <div>
          {title && <h3 className="text-sm font-semibold text-text-primary">{title}</h3>}
          {description && <p className="mt-1 text-xs text-text-secondary">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

/** DrawerActions - Footer actions (Cancel/Save) */
export interface DrawerActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function DrawerActions({ children, className }: DrawerActionsProps) {
  return (
    <div
      className={cn(
        'flex flex-shrink-0 items-center justify-end gap-3 border-t border-border px-6 py-4',
        className
      )}
    >
      {children}
    </div>
  );
}

export default Drawer;

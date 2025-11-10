/**
 * KeyboardShortcuts - Overlay showing all keyboard shortcuts
 * 
 * Triggered by pressing '?' (Shift + /)
 */

import { X } from 'lucide-react';
import { useEffect, useRef, useId } from 'react';
import type { MouseEvent } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = {
  'Global': [
    { key: '?', description: 'Show this shortcuts menu' },
    { key: '/', description: 'Search (coming soon)' },
    { key: 'Ctrl + K', description: 'Quick Actions (coming soon)' },
    { key: 'ESC', description: 'Close modals/dialogs' },
  ],
  'Navigation': [
    { key: 'Alt + B', description: 'Go to Board' },
    { key: 'Alt + A', description: 'Go to Analyze' },
    { key: 'Alt + C', description: 'Go to Chart' },
    { key: 'Alt + J', description: 'Go to Journal' },
    { key: 'Alt + N', description: 'Go to Notifications' },
    { key: 'Alt + S', description: 'Go to Settings' },
  ],
  'Chart Tools': [
    { key: 'C', description: 'Enter drawing mode' },
    { key: 'I', description: 'Add indicator' },
    { key: 'Space', description: 'Pause/Resume replay' },
    { key: '← →', description: 'Skip forward/backward in replay' },
    { key: '+ −', description: 'Zoom in/out' },
  ],
  'Journal': [
    { key: 'Ctrl + N', description: 'New entry (coming soon)' },
    { key: 'Ctrl + S', description: 'Save entry (coming soon)' },
    { key: 'Ctrl + E', description: 'Export (coming soon)' },
  ],
};

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const modalRef = useFocusTrap<HTMLDivElement>({
    isActive: isOpen,
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  });
  const handleOverlayMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      onMouseDown={handleOverlayMouseDown}
      data-testid="modal-overlay"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl animate-slide-up"
        onMouseDown={(e) => e.stopPropagation()}
        data-testid="modal-content"
      >
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 id={headingId} className="text-2xl font-bold">
              ⌨️ Keyboard Shortcuts
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Speed up your workflow with these shortcuts
            </p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 transition-colors p-2 rounded-lg hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid gap-6 md:grid-cols-2">
          {Object.entries(shortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                {category}
              </h3>
              <ul className="space-y-2">
                {items.map((shortcut, index) => (
                  <li 
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors"
                  >
                    <span className="text-zinc-300 text-sm">
                      {shortcut.description}
                    </span>
                    <kbd className="ml-3 px-2 py-1 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded shadow-sm text-zinc-300 whitespace-nowrap">
                      {shortcut.key}
                    </kbd>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 px-6 py-4 bg-zinc-900/50">
          <div className="flex items-center justify-between text-sm">
            <p className="text-zinc-500">
              Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">ESC</kbd> to close
            </p>
            <button
              onClick={() => window.print()}
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Print Shortcuts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { formatShortcut } from '@/hooks/useKeyboardShortcut';

interface Shortcut {
  keys: string;
  description: string;
  category?: string;
}

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Shortcut[];
}

export function KeyboardShortcutsDialog({ isOpen, onClose, shortcuts }: KeyboardShortcutsDialogProps) {
  if (!isOpen) return null;

  // Group shortcuts by category
  const grouped = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay/70 backdrop-blur px-4 py-8"
      onClick={onClose}
    >
      <div
        className="glass-heavy w-full max-w-2xl rounded-3xl border border-border-moderate p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-surface-hover transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto scrollbar-custom">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs uppercase tracking-wide text-text-tertiary font-semibold mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border hover:bg-surface-hover transition-colors"
                  >
                    <span className="text-sm text-text-primary">
                      {shortcut.description}
                    </span>
                    <kbd className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-moderate font-mono text-xs text-text-secondary">
                      {formatShortcut(shortcut.keys)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border-subtle">
          <p className="text-xs text-text-tertiary text-center">
            Press <kbd className="px-2 py-0.5 rounded bg-surface-elevated border border-border-moderate font-mono">?</kbd> to toggle this dialog
          </p>
        </div>
      </div>
    </div>
  );
}

// Default Sparkfined shortcuts
export const defaultShortcuts: Shortcut[] = [
  // Navigation
  { keys: 'cmd+k', description: 'Command Palette', category: 'Navigation' },
  { keys: 'cmd+1', description: 'Go to Dashboard', category: 'Navigation' },
  { keys: 'cmd+2', description: 'Go to Journal', category: 'Navigation' },
  { keys: 'cmd+3', description: 'Go to Watchlist', category: 'Navigation' },
  { keys: 'cmd+4', description: 'Go to Alerts', category: 'Navigation' },
  { keys: 'cmd+5', description: 'Go to Chart', category: 'Navigation' },
  { keys: '?', description: 'Show Keyboard Shortcuts', category: 'Navigation' },
  
  // Actions
  { keys: 'cmd+n', description: 'New Journal Entry', category: 'Actions' },
  { keys: 'cmd+s', description: 'Save', category: 'Actions' },
  { keys: 'cmd+f', description: 'Search', category: 'Actions' },
  { keys: 'esc', description: 'Close Dialog', category: 'Actions' },
  
  // Journal
  { keys: 'cmd+enter', description: 'Save Entry', category: 'Journal' },
  { keys: 'cmd+e', description: 'Edit Entry', category: 'Journal' },
  { keys: 'cmd+d', description: 'Delete Entry', category: 'Journal' },
  
  // Watchlist
  { keys: 'cmd+a', description: 'Add to Watchlist', category: 'Watchlist' },
  { keys: 'j', description: 'Next Item', category: 'Watchlist' },
  { keys: 'k', description: 'Previous Item', category: 'Watchlist' },
];

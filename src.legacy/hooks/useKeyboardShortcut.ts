import { useEffect, useCallback, useRef } from 'react';

type KeyCombo = string; // e.g., "cmd+k", "ctrl+s", "esc"

interface ShortcutOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  allowInInput?: boolean;
}

export function useKeyboardShortcut(
  shortcut: KeyCombo,
  callback: () => void,
  options: ShortcutOptions = {}
) {
  const { enabled = true, preventDefault = true, allowInInput = false } = options;
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if focus is in an input/textarea
      const target = event.target as HTMLElement;
      const isInInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if (isInInput && !allowInInput) return;

      const keys = shortcut.toLowerCase().split('+');
      const isMatch = keys.every((key) => {
        switch (key) {
          case 'cmd':
          case 'meta':
            return event.metaKey;
          case 'ctrl':
          case 'control':
            return event.ctrlKey;
          case 'alt':
          case 'option':
            return event.altKey;
          case 'shift':
            return event.shiftKey;
          default:
            return event.key.toLowerCase() === key;
        }
      });

      if (isMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callbackRef.current();
      }
    },
    [shortcut, enabled, preventDefault, allowInInput]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}

// Hook for multiple shortcuts
export function useKeyboardShortcuts(
  shortcuts: Record<KeyCombo, () => void>,
  options: ShortcutOptions = {}
) {
  const { enabled = true, preventDefault = true, allowInInput = false } = options;
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;
      const isInInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if (isInInput && !allowInInput) return;

      for (const [shortcut, callback] of Object.entries(shortcutsRef.current)) {
        const keys = shortcut.toLowerCase().split('+');
        const isMatch = keys.every((key) => {
          switch (key) {
            case 'cmd':
            case 'meta':
              return event.metaKey;
            case 'ctrl':
            case 'control':
              return event.ctrlKey;
            case 'alt':
            case 'option':
              return event.altKey;
            case 'shift':
              return event.shiftKey;
            default:
              return event.key.toLowerCase() === key;
          }
        });

        if (isMatch) {
          if (preventDefault) {
            event.preventDefault();
          }
          callback();
          break;
        }
      }
    },
    [enabled, preventDefault, allowInInput]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}

// Utility to get the correct meta key for the platform
export function getMetaKey(): 'cmd' | 'ctrl' {
  if (typeof window === 'undefined') return 'ctrl';
  return navigator.platform.toLowerCase().includes('mac') ? 'cmd' : 'ctrl';
}

// Format shortcut for display
export function formatShortcut(shortcut: KeyCombo): string {
  const metaKey = getMetaKey();
  return shortcut
    .split('+')
    .map((key) => {
      switch (key.toLowerCase()) {
        case 'cmd':
        case 'meta':
          return metaKey === 'cmd' ? '⌘' : 'Ctrl';
        case 'ctrl':
        case 'control':
          return 'Ctrl';
        case 'alt':
        case 'option':
          return metaKey === 'cmd' ? '⌥' : 'Alt';
        case 'shift':
          return '⇧';
        default:
          return key.toUpperCase();
      }
    })
    .join('+');
}

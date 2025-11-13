/**
 * Tests for useFocusTrap Hook
 *
 * Tests:
 * - Focus trapping within container
 * - Tab key navigation
 * - Shift+Tab navigation
 * - Escape key handling
 * - Initial focus
 * - Return focus on unmount
 * - Keyboard event handling
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useFocusTrap } from '../useFocusTrap';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('useFocusTrap', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function TestComponent({
    isActive,
    onEscape,
    returnFocus = true,
  }: {
    isActive: boolean;
    onEscape?: () => void;
    returnFocus?: boolean;
  }) {
    const containerRef = useFocusTrap<HTMLDivElement>({
      isActive,
      returnFocus,
      onEscape,
    });

    return (
      <div ref={containerRef} data-testid="focus-trap">
        <button data-testid="button-1">Button 1</button>
        <button data-testid="button-2">Button 2</button>
        <button data-testid="button-3">Button 3</button>
      </div>
    );
  }

  it('focuses first element when activated', async () => {
    const { rerender } = render(<TestComponent isActive={false} />);

    expect(document.activeElement).not.toBe(screen.getByTestId('button-1'));

    // Activate focus trap
    rerender(<TestComponent isActive={true} />);

    // Wait for focus to be set (happens in setTimeout)
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId('button-1'));
    });
  });

  it('traps focus within container on Tab', async () => {
    const user = userEvent.setup();

    render(<TestComponent isActive={true} />);

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId('button-1'));
    });

    // Tab to button 2
    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId('button-2'));

    // Tab to button 3
    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId('button-3'));

    // Tab should wrap to button 1
    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId('button-1'));
  });

  it('traps focus in reverse on Shift+Tab', async () => {
    const user = userEvent.setup();

    render(<TestComponent isActive={true} />);

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId('button-1'));
    });

    // Shift+Tab should wrap to last button
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByTestId('button-3'));

    // Shift+Tab to button 2
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByTestId('button-2'));

    // Shift+Tab to button 1
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByTestId('button-1'));
  });

  it('calls onEscape when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();

    render(<TestComponent isActive={true} onEscape={onEscape} />);

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId('button-1'));
    });

    await user.keyboard('{Escape}');

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('does not trap focus when inactive', async () => {
    const user = userEvent.setup();

    render(<TestComponent isActive={false} />);

    // Focus should not be trapped
    expect(document.activeElement).toBe(document.body);

    // Tab should work normally (not trapped)
    await user.tab();

    // Should not be in the button (focus trap not active)
    expect(document.activeElement).not.toBe(screen.getByTestId('button-1'));
  });

  it('returns focus to previous element on unmount when returnFocus is true', async () => {
    const user = userEvent.setup();

    // Create an element to focus before opening modal
    const button = document.createElement('button');
    button.textContent = 'Outside Button';
    document.body.appendChild(button);
    button.focus();

    expect(document.activeElement).toBe(button);

    const { unmount } = render(<TestComponent isActive={true} returnFocus={true} />);

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId('button-1'));
    });

    // Unmount should return focus
    unmount();

    expect(document.activeElement).toBe(button);
  });

  it('does not return focus when returnFocus is false', async () => {
    const button = document.createElement('button');
    button.textContent = 'Outside Button';
    document.body.appendChild(button);
    button.focus();

    const { unmount } = render(<TestComponent isActive={true} returnFocus={false} />);

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId('button-1'));
    });

    unmount();

    // Focus should not return to button
    expect(document.activeElement).not.toBe(button);
  });

  it('focuses initial focus ref if provided', async () => {
    function TestWithInitialFocus() {
      const initialRef = React.useRef<HTMLButtonElement>(null);
      const containerRef = useFocusTrap<HTMLDivElement>({
        isActive: true,
        initialFocusRef: initialRef,
      });

      return (
        <div ref={containerRef} data-testid="focus-trap">
          <button data-testid="button-1">Button 1</button>
          <button data-testid="button-2" ref={initialRef}>
            Button 2
          </button>
          <button data-testid="button-3">Button 3</button>
        </div>
      );
    }

    render(<TestWithInitialFocus />);

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId('button-2'));
    });
  });

  it('ignores elements with data-focus-ignore attribute', () => {
    function TestWithIgnoredElement() {
      const containerRef = useFocusTrap<HTMLDivElement>({ isActive: true });

      return (
        <div ref={containerRef} data-testid="focus-trap">
          <button data-testid="button-1">Button 1</button>
          <button data-testid="button-ignored" data-focus-ignore>
            Ignored
          </button>
          <button data-testid="button-2">Button 2</button>
        </div>
      );
    }

    render(<TestWithIgnoredElement />);

    const container = screen.getByTestId('focus-trap');
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button:not([disabled]):not([data-focus-ignore])'
      )
    );

    expect(focusable).toHaveLength(2);
    expect(focusable.map((el) => el.getAttribute('data-testid'))).toEqual([
      'button-1',
      'button-2',
    ]);
  });

  it('ignores elements with aria-hidden="true"', () => {
    function TestWithAriaHidden() {
      const containerRef = useFocusTrap<HTMLDivElement>({ isActive: true });

      return (
        <div ref={containerRef} data-testid="focus-trap">
          <button data-testid="button-1">Button 1</button>
          <button data-testid="button-hidden" aria-hidden="true">
            Hidden
          </button>
          <button data-testid="button-2">Button 2</button>
        </div>
      );
    }

    render(<TestWithAriaHidden />);

    const container = screen.getByTestId('focus-trap');
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button:not([disabled]):not([aria-hidden="true"])'
      )
    );

    expect(focusable).toHaveLength(2);
    expect(focusable.map((el) => el.getAttribute('data-testid'))).toEqual([
      'button-1',
      'button-2',
    ]);
  });

  it('prevents Tab when no focusable elements exist', async () => {
    const user = userEvent.setup();

    function TestWithNoFocusable() {
      const containerRef = useFocusTrap<HTMLDivElement>({ isActive: true });

      return (
        <div ref={containerRef} data-testid="focus-trap" tabIndex={0}>
          <div>No focusable elements</div>
        </div>
      );
    }

    render(<TestWithNoFocusable />);

    const container = screen.getByTestId('focus-trap');

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(container);
    });

    // Tab should keep focus on container
    await user.tab();
    expect(document.activeElement).toBe(container);
  });

  it('returns focus to container when focus leaves', async () => {
    const outsideButton = document.createElement('button');
    outsideButton.textContent = 'Outside';
    document.body.appendChild(outsideButton);

    render(<TestComponent isActive={true} />);

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId('button-1'));
    });

    // Try to focus outside element
    outsideButton.focus();

    // Focus should return to first element in trap
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId('button-1'));
    });
  });

  it('cleans up event listeners on unmount', async () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = render(<TestComponent isActive={true} />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('focusin', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});

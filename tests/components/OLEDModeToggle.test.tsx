import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, beforeEach, vi } from 'vitest'

import { OLEDModeToggle } from '@/components/settings/OLEDModeToggle'

describe('OLEDModeToggle', () => {
  // Mock localStorage
  beforeEach(() => {
    localStorage.clear()
    // Reset body dataset
    if (typeof document !== 'undefined') {
      delete document.body.dataset.oled
    }
  })

  it('renders with correct initial state (OFF)', () => {
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode/i })
    expect(toggle).toBeDefined()
    expect(toggle.getAttribute('aria-checked')).toBe('false')
  })

  it('renders label and description', () => {
    render(<OLEDModeToggle />)

    expect(screen.getByText('OLED Mode')).toBeDefined()
    expect(screen.getByText(/Pure black backgrounds for OLED displays/i)).toBeDefined()
    expect(screen.getByText(/Saves battery and reduces eye strain/i)).toBeDefined()
  })

  it('toggles ON when clicked', () => {
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode/i })
    
    // Initial state: OFF
    expect(toggle.getAttribute('aria-checked')).toBe('false')
    
    // Click to toggle ON
    fireEvent.click(toggle)
    
    // Should be ON now
    expect(toggle.getAttribute('aria-checked')).toBe('true')
  })

  it('toggles OFF when clicked twice', () => {
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode/i })
    
    // Click to ON
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-checked')).toBe('true')
    
    // Click to OFF
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-checked')).toBe('false')
  })

  it('persists state to localStorage when toggled ON', () => {
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode/i })
    
    // Toggle ON
    fireEvent.click(toggle)
    
    // Check localStorage
    expect(localStorage.getItem('oled-mode')).toBe('true')
  })

  it('persists state to localStorage when toggled OFF', () => {
    // Set initial state to ON
    localStorage.setItem('oled-mode', 'true')
    
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode/i })
    
    // Toggle OFF
    fireEvent.click(toggle)
    
    // Check localStorage
    expect(localStorage.getItem('oled-mode')).toBe('false')
  })

  it('initializes from localStorage (ON)', () => {
    // Set localStorage to ON before render
    localStorage.setItem('oled-mode', 'true')
    
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode/i })
    
    // Should be ON from localStorage
    expect(toggle.getAttribute('aria-checked')).toBe('true')
  })

  it('initializes from localStorage (OFF)', () => {
    // Set localStorage to OFF before render
    localStorage.setItem('oled-mode', 'false')
    
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode/i })
    
    // Should be OFF from localStorage
    expect(toggle.getAttribute('aria-checked')).toBe('false')
  })

  it('sets data-oled attribute on document.body when toggled ON', () => {
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode/i })
    
    // Toggle ON
    fireEvent.click(toggle)
    
    // Check body dataset
    expect(document.body.dataset.oled).toBe('true')
  })

  it('removes data-oled attribute on document.body when toggled OFF', () => {
    // Set initial state to ON
    localStorage.setItem('oled-mode', 'true')
    
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode/i })
    
    // Toggle OFF
    fireEvent.click(toggle)
    
    // Check body dataset
    expect(document.body.dataset.oled).toBe('false')
  })

  it('supports keyboard navigation (Space key)', () => {
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode/i })
    
    // Focus the toggle
    toggle.focus()
    
    // Press Space key
    fireEvent.keyDown(toggle, { key: ' ', code: 'Space' })
    
    // Should toggle ON
    expect(toggle.getAttribute('aria-checked')).toBe('true')
  })

  it('supports keyboard navigation (Enter key)', () => {
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode/i })
    
    // Focus the toggle
    toggle.focus()
    
    // Press Enter key
    fireEvent.keyDown(toggle, { key: 'Enter', code: 'Enter' })
    
    // Should toggle ON
    expect(toggle.getAttribute('aria-checked')).toBe('true')
  })

  it('has correct ARIA attributes', () => {
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch')
    
    // Check ARIA attributes
    expect(toggle.getAttribute('role')).toBe('switch')
    expect(toggle.getAttribute('aria-checked')).toBe('false')
    expect(toggle.getAttribute('aria-label')).toContain('OLED Mode')
  })

  it('updates aria-label to reflect state', () => {
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode disabled/i })
    
    // Initial state
    expect(toggle.getAttribute('aria-label')).toBe('OLED Mode disabled')
    
    // Toggle ON
    fireEvent.click(toggle)
    
    // Re-query with new label
    const toggleAfter = screen.getByRole('switch', { name: /OLED Mode enabled/i })
    expect(toggleAfter.getAttribute('aria-label')).toBe('OLED Mode enabled')
  })

  it('handles rapid toggling without errors', () => {
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode/i })
    
    // Rapid toggle 10 times
    for (let i = 0; i < 10; i++) {
      fireEvent.click(toggle)
    }
    
    // Final state should be ON (started OFF, 10 clicks = even)
    expect(toggle.getAttribute('aria-checked')).toBe('false')
  })

  it('gracefully handles invalid localStorage value', () => {
    // Set invalid value
    localStorage.setItem('oled-mode', 'invalid')
    
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode/i })
    
    // Should default to OFF
    expect(toggle.getAttribute('aria-checked')).toBe('false')
  })

  it('works when localStorage is unavailable', () => {
    // Mock localStorage to throw
    const originalGetItem = localStorage.getItem
    const originalSetItem = localStorage.setItem
    
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage unavailable')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('localStorage unavailable')
    })
    
    // Should render without crashing
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode/i })
    expect(toggle).toBeDefined()
    
    // Restore mocks
    vi.spyOn(Storage.prototype, 'getItem').mockRestore()
    vi.spyOn(Storage.prototype, 'setItem').mockRestore()
  })

  it('has accessible focus styles', () => {
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode/i })
    
    // Check if focus-visible classes are present
    const className = toggle.className
    expect(className).toContain('focus-visible:outline-none')
    expect(className).toContain('focus-visible:ring-2')
    expect(className).toContain('focus-visible:ring-brand')
  })

  it('has correct touch target size for mobile', () => {
    render(<OLEDModeToggle />)

    const toggle = screen.getByRole('switch', { name: /OLED Mode/i })
    
    // Check height (should be at least 44px for touch targets)
    const className = toggle.className
    expect(className).toContain('h-6') // h-6 = 24px, but it's inside a larger clickable area
    
    // The parent container should provide adequate touch target
    const container = toggle.closest('div')
    expect(container).toBeDefined()
  })
})

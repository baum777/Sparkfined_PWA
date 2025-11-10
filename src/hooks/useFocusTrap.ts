import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

type UseFocusTrapOptions = {
  isActive: boolean
  initialFocusRef?: React.RefObject<HTMLElement | null>
  returnFocus?: boolean
  onEscape?: () => void
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => {
    if (element.hasAttribute('data-focus-ignore')) return false
    const ariaHidden = element.getAttribute('aria-hidden')
    return ariaHidden !== 'true'
  })
}

export function useFocusTrap<T extends HTMLElement>({
  isActive,
  initialFocusRef,
  returnFocus = true,
  onEscape,
}: UseFocusTrapOptions) {
  const containerRef = useRef<T | null>(null)
  const lastActiveRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const node = containerRef.current
    if (!isActive || !node) {
      return
    }

    lastActiveRef.current = document.activeElement as HTMLElement

    const focusFirstElement = () => {
      const focusTarget = initialFocusRef?.current ?? getFocusableElements(node)[0] ?? node
      if (focusTarget) {
        focusTarget.focus()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape?.()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusable = getFocusableElements(node)
      if (focusable.length === 0) {
        event.preventDefault()
        node.focus()
        return
      }

      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      const activeElement = document.activeElement as HTMLElement

      if (event.shiftKey) {
        if (activeElement === first || activeElement === node) {
          event.preventDefault()
          last.focus()
        }
        return
      }

      if (activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const handleFocusOutside = (event: FocusEvent) => {
      if (!node.contains(event.target as Node)) {
        focusFirstElement()
      }
    }

    const timeout = window.setTimeout(focusFirstElement)

    node.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', handleFocusOutside)

    return () => {
      window.clearTimeout(timeout)
      node.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', handleFocusOutside)
      if (returnFocus && lastActiveRef.current) {
        lastActiveRef.current.focus()
      }
    }
  }, [isActive, initialFocusRef, returnFocus, onEscape])

  return containerRef
}

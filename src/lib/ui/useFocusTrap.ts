import { RefObject, useEffect } from "react"

type FocusTarget = HTMLElement | null | undefined

function resolveInitialFocus(target?: FocusTarget | RefObject<HTMLElement>) {
  if (!target) return null
  if ("current" in target) return target.current
  return target
}

const FOCUSABLE_SELECTOR = [
  "[data-focus-trap]",
  "button:not([disabled])",
  "[href]",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",")

export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  isActive: boolean,
  options?: { initialFocus?: FocusTarget | RefObject<HTMLElement> }
) {
  useEffect(() => {
    if (!isActive) return
    const container = containerRef.current
    if (!container) return

    const findFocusable = () => {
      const elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      return elements.filter((node) => node.offsetParent !== null || node.getAttribute("data-focus-trap") === "true")
    }

    const initialFocus = resolveInitialFocus(options?.initialFocus) ?? findFocusable()[0] ?? container
    initialFocus?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return
      const focusable = findFocusable()
      if (!focusable.length) {
        event.preventDefault()
        container.focus()
        return
      }

      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey) {
        if (active === first || active === container) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    container.addEventListener("keydown", handleKeyDown)
    return () => container.removeEventListener("keydown", handleKeyDown)
  }, [containerRef, isActive, options?.initialFocus])
}

import {
  Children,
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/design-system/utils/cn'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  content: ReactNode
  placement?: TooltipPlacement
  openDelay?: number
  closeDelay?: number
  children: ReactElement
}

const placementOffsets: Record<TooltipPlacement, { x: number; y: number }> = {
  top: { x: 0, y: -8 },
  bottom: { x: 0, y: 8 },
  left: { x: -8, y: 0 },
  right: { x: 8, y: 0 },
}

export function Tooltip({ children, content, placement = 'top', openDelay = 150, closeDelay = 80 }: TooltipProps) {
  const triggerRef = useRef<HTMLElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const id = useId()
  const openTimer = useRef<number>()
  const closeTimer = useRef<number>()
  const [isPortalReady, setPortalReady] = useState(false)

  useEffect(() => {
    setPortalReady(typeof document !== 'undefined')
    return () => {
      clearTimeout(openTimer.current)
      clearTimeout(closeTimer.current)
    }
  }, [])

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const offset = placementOffsets[placement]
    let top = rect.top + window.scrollY + offset.y
    let left = rect.left + window.scrollX + offset.x

    switch (placement) {
      case 'top':
        top = rect.top + window.scrollY - 8
        left = rect.left + window.scrollX + rect.width / 2
        break
      case 'bottom':
        top = rect.bottom + window.scrollY + 8
        left = rect.left + window.scrollX + rect.width / 2
        break
      case 'left':
        top = rect.top + window.scrollY + rect.height / 2
        left = rect.left + window.scrollX - 8
        break
      case 'right':
        top = rect.top + window.scrollY + rect.height / 2
        left = rect.right + window.scrollX + 8
        break
    }

    setPosition({ top, left })
  }, [placement])

  useEffect(() => {
    if (!isOpen) return
    updatePosition()
    const handleReposition = () => updatePosition()
    window.addEventListener('scroll', handleReposition, true)
    window.addEventListener('resize', handleReposition)
    return () => {
      window.removeEventListener('scroll', handleReposition, true)
      window.removeEventListener('resize', handleReposition)
    }
  }, [isOpen, updatePosition])

  const openTooltip = () => {
    clearTimeout(closeTimer.current)
    openTimer.current = window.setTimeout(() => setIsOpen(true), openDelay)
  }

  const closeTooltip = () => {
    clearTimeout(openTimer.current)
    closeTimer.current = window.setTimeout(() => setIsOpen(false), closeDelay)
  }

  const child = Children.only(children)
  const originalRef = (child as any).ref as Ref<HTMLElement> | undefined

  const setRefs = (node: HTMLElement | null) => {
    triggerRef.current = node
    if (!originalRef) return
    if (typeof originalRef === 'function') {
      originalRef(node)
    } else {
      ;(originalRef as MutableRefObject<HTMLElement | null>).current = node
    }
  }

  const triggerProps = {
    ref: setRefs,
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
      child.props.onMouseEnter?.(event)
      openTooltip()
    },
    onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
      child.props.onMouseLeave?.(event)
      closeTooltip()
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      child.props.onFocus?.(event)
      openTooltip()
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      child.props.onBlur?.(event)
      closeTooltip()
    },
    'aria-describedby': isOpen ? id : child.props['aria-describedby'],
  }

  return (
    <>
      {cloneElement(child, triggerProps)}
      {isPortalReady &&
        createPortal(
          <AnimatePresence>
            {isOpen ? (
              <motion.div
                key={id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'pointer-events-none absolute z-[1500] max-w-xs rounded-lg border border-spark/30 bg-void-lightest/95 px-3 py-2 text-xs text-mist shadow-glow-spark',
                  placement === 'top' || placement === 'bottom' ? 'translate-x-[-50%]' : 'translate-y-[-50%]'
                )}
                style={{ top: position.top, left: position.left }}
                role="tooltip"
                id={id}
              >
                {content}
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}

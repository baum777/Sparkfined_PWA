import React from "react"
import { cn } from "@/lib/ui/cn"

export interface SectionNavItem {
  label: string
  href: string
}

interface SectionNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: SectionNavItem[]
  title?: string
  stickyOffset?: number
}

export function SectionNav({ items, title, stickyOffset = 80, className, ...props }: SectionNavProps) {
  return (
    <nav
      aria-label="Section navigation"
      className={cn("text-sm text-text-secondary", className)}
      {...props}
    >
      <div
        className="space-y-3 rounded-2xl border border-border/70 bg-surface/80 p-4 backdrop-blur"
        style={{ position: "sticky", top: `${stickyOffset}px` }}
      >
        {title ? <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">{title}</p> : null}
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.href}>
              <a
                className="flex items-center justify-between rounded-lg px-3 py-2 text-left transition hover:bg-surface-hover/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                href={item.href}
              >
                <span className="font-medium text-text-primary">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default SectionNav

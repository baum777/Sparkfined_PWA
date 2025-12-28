import React from "react"
import { cn } from "@/lib/ui/cn"

type MaxWidth = "lg" | "xl" | "2xl" | "full"

const maxWidthClasses: Record<MaxWidth, string> = {
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  full: "max-w-none",
}

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: MaxWidth
  padded?: boolean
}

export function Container({ maxWidth = "xl", padded = true, className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        maxWidthClasses[maxWidth],
        padded && "px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    />
  )
}

export default Container

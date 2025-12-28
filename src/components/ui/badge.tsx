import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand/60",
  {
    variants: {
      variant: {
        // Default - brand colored
        default: 
          "border border-brand/30 bg-brand/10 text-brand",
        // Secondary - subtle surface
        secondary: 
          "border border-border-sf-moderate bg-surface-subtle text-text-secondary",
        // Outline - just border
        outline: 
          "border border-border-sf-moderate bg-transparent text-text-primary",
        
        // Trading sentiment variants
        bull: 
          "border border-sentiment-bull-border bg-sentiment-bull-bg text-sentiment-bull",
        bear: 
          "border border-sentiment-bear-border bg-sentiment-bear-bg text-sentiment-bear",
        neutral: 
          "border border-sentiment-neutral-border bg-sentiment-neutral-bg text-warning",
        
        // System state variants
        success: 
          "border border-sentiment-bull-border bg-sentiment-bull-bg text-sentiment-bull",
        destructive: 
          "border border-sentiment-bear-border bg-sentiment-bear-bg text-sentiment-bear",
        warning: 
          "border border-sentiment-neutral-border bg-sentiment-neutral-bg text-warning",
        info: 
          "border border-info/30 bg-info/10 text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Sparkfined Primary - brand green with glow
        default:
          "rounded-xl bg-brand text-black hover:bg-brand-hover shadow-glow-brand focus:ring-2 focus:ring-brand/60",
        // Sparkfined Secondary - surface with border
        secondary:
          "rounded-xl bg-surface-subtle text-text-primary border border-border-sf-moderate hover:bg-surface-hover hover:border-brand focus:ring-2 focus:ring-brand/60",
        // Destructive - bear/danger styling
        destructive:
          "rounded-xl bg-sentiment-bear-bg text-sentiment-bear border border-sentiment-bear-border hover:bg-danger/20 focus:ring-2 focus:ring-danger/60",
        // Outline - subtle border
        outline:
          "rounded-xl border border-border-sf-moderate bg-transparent text-text-primary hover:bg-surface-hover hover:border-border-sf-hover",
        // Ghost - no background, subtle hover
        ghost:
          "rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary",
        // Link - text only with underline
        link: "text-brand underline-offset-4 hover:underline hover:text-brand-hover",
        // Success - bull/success styling
        success:
          "rounded-xl bg-sentiment-bull-bg text-sentiment-bull border border-sentiment-bull-border hover:bg-success/20 focus:ring-2 focus:ring-success/60",
      },
      size: {
        default: "h-11 px-4 py-2.5",
        sm: "h-9 px-3 py-2",
        lg: "h-12 px-6 py-3",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

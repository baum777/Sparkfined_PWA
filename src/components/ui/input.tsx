import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-xl text-text-primary placeholder:text-text-tertiary transition-all duration-150 outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        // Default input with Sparkfined styling
        default: 
          "bg-surface-subtle border border-border-sf-moderate focus:border-brand focus:ring-2 focus:ring-brand/40 focus:shadow-glow-accent",
        // Ghost input - minimal styling
        ghost: 
          "bg-transparent border-transparent focus:bg-surface-subtle focus:border-border-sf-moderate",
        // Filled input - solid background
        filled:
          "bg-surface border border-transparent focus:border-brand focus:ring-2 focus:ring-brand/40",
      },
      inputSize: {
        default: "h-12 px-4 text-sm",
        sm: "h-9 px-3 text-xs",
        lg: "h-14 px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  // Base styles matching Input component
  "flex w-full rounded-lg text-sm transition-all duration-150 placeholder:text-text-tertiary disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-subtle/50",
  {
    variants: {
      variant: {
        default: [
          "bg-surface-subtle border border-border-sf-moderate text-text-primary",
          "hover:border-border-sf-strong",
          "focus:outline-none focus:border-brand focus:shadow-glow-accent",
        ],
        ghost: [
          "bg-transparent border border-transparent text-text-primary",
          "hover:bg-surface-subtle/50 hover:border-border-sf-subtle",
          "focus:outline-none focus:bg-surface-subtle focus:border-brand focus:shadow-glow-accent",
        ],
        filled: [
          "bg-surface border border-border-sf-subtle text-text-primary",
          "hover:bg-surface-subtle hover:border-border-sf-moderate",
          "focus:outline-none focus:border-brand focus:shadow-glow-accent",
        ],
      },
      textareaSize: {
        sm: "min-h-[60px] px-3 py-2 text-xs",
        default: "min-h-[80px] px-4 py-3 text-sm",
        lg: "min-h-[120px] px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      textareaSize: "default",
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, textareaSize, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, textareaSize, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };

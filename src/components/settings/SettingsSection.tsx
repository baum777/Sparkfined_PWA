import { cn } from "@/lib/utils";
import React from "react";

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  priority?: boolean;
  "data-testid"?: string;
}

export function SettingsSection({
  title,
  description,
  icon,
  children,
  className,
  priority = false,
  "data-testid": testId,
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-4 sm:p-6",
        priority && "ring-1 ring-primary/20",
        className
      )}
      data-testid={testId}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2">
          {icon && <div className="flex-shrink-0 text-muted-foreground">{icon}</div>}
          <h2 className={cn(
            "text-lg font-semibold text-foreground",
            priority && "text-primary"
          )}>
            {title}
          </h2>
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

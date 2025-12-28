import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  priority?: boolean;
  "data-testid"?: string;
}

export function SettingsSection({
  title,
  description,
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
        <h2 className={cn(
          "text-lg font-semibold text-foreground",
          priority && "text-primary"
        )}>
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

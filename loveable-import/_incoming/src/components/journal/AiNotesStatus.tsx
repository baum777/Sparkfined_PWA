import { Badge } from "@/components/ui/badge";
import { Sparkles, WifiOff, FlaskConical } from "lucide-react";

type AiStatus = "demo" | "offline" | "ready";

interface AiNotesStatusProps {
  status: AiStatus;
}

const STATUS_CONFIG: Record<
  AiStatus,
  { label: string; icon: React.ReactNode; variant: "secondary" | "success"; description: string }
> = {
  demo: {
    label: "Demo",
    icon: <FlaskConical className="h-3 w-3" />,
    variant: "secondary",
    description: "AI insights are placeholder examples",
  },
  offline: {
    label: "Offline",
    icon: <WifiOff className="h-3 w-3" />,
    variant: "secondary",
    description: "AI features currently unavailable",
  },
  ready: {
    label: "AI Ready",
    icon: <Sparkles className="h-3 w-3" />,
    variant: "success",
    description: "AI will analyze your notes",
  },
};

export function AiNotesStatus({ status }: AiNotesStatusProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2" data-testid="ai-notes-status">
      <Badge
        variant={config.variant}
        className="gap-1 px-2 py-0.5 text-xs font-normal"
      >
        {config.icon}
        {config.label}
      </Badge>
      <span className="text-xs text-muted-foreground">
        {config.description}
      </span>
    </div>
  );
}

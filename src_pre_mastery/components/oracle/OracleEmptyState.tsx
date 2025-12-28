import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface OracleEmptyStateProps {
  filter: 'all' | 'new' | 'read';
}

export function OracleEmptyState({ filter }: OracleEmptyStateProps) {
  const messages = {
    all: "No insights yet. Keep trading and journaling to unlock AI analysis.",
    new: "All caught up! No new insights to review.",
    read: "No reviewed insights yet. Mark insights as read to track your progress.",
  };

  return (
    <Card data-testid="oracle-empty-state">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary mb-4">
          <Sparkles className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground max-w-sm">
          {messages[filter]}
        </p>
      </CardContent>
    </Card>
  );
}

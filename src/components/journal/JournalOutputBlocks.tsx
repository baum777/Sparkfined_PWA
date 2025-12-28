import { Brain, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ArchetypeScoreCardProps {
  archetype?: string;
  score?: number;
  description?: string;
}

export function ArchetypeScoreCard({ 
  archetype = "Analyzer",
  score = 72,
  description = "You tend to be methodical and research-driven"
}: ArchetypeScoreCardProps) {
  return (
    <Card data-testid="archetype-score-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Your Archetype
          </CardTitle>
          <Badge variant="secondary">{score}/100</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold">{archetype}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

interface MetricsGridProps {
  winRate?: number;
  avgRR?: number;
  consistency?: number;
  discipline?: number;
}

export function MetricsGrid({
  winRate = 0,
  avgRR = 0,
  consistency = 0,
  discipline = 0,
}: MetricsGridProps) {
  const metrics = [
    { label: "Win Rate", value: `${winRate}%`, icon: Target },
    { label: "Avg R:R", value: avgRR.toFixed(2), icon: TrendingUp },
    { label: "Consistency", value: `${consistency}%`, icon: Brain },
    { label: "Discipline", value: `${discipline}%`, icon: AlertTriangle },
  ];

  return (
    <div className="grid grid-cols-2 gap-3" data-testid="metrics-grid">
      {metrics.map((m) => (
        <Card key={m.label} className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <m.icon className="h-3.5 w-3.5" />
            {m.label}
          </div>
          <p className="text-xl font-bold mt-1">{m.value}</p>
        </Card>
      ))}
    </div>
  );
}

interface InsightCardItemProps {
  title: string;
  description: string;
  type: "success" | "warning" | "info";
}

export function InsightCardItem({ title, description, type }: InsightCardItemProps) {
  const bgColors = {
    success: "bg-success/10 border-success/20",
    warning: "bg-warning/10 border-warning/20",
    info: "bg-primary/10 border-primary/20",
  };

  return (
    <div className={`rounded-md border p-3 ${bgColors[type]}`} data-testid="insight-card-item">
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

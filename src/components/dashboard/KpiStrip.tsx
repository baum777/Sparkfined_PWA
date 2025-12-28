import { TrendingUp, Target, BarChart3, Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiItem {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}

interface KpiStripProps {
  winRate: number;
  avgRR: number;
  totalTrades: number;
  streak: number;
  bestTrade: string;
}

export function KpiStrip({ 
  winRate, 
  avgRR, 
  totalTrades, 
  streak,
  bestTrade
}: KpiStripProps) {
  const kpis: KpiItem[] = [
    {
      label: "Win Rate",
      value: totalTrades > 0 ? `${winRate.toFixed(0)}%` : "—",
      icon: Target,
      trend: winRate >= 50 ? "up" : winRate > 0 ? "down" : "neutral",
    },
    {
      label: "Avg R:R",
      value: totalTrades > 0 ? avgRR.toFixed(2) : "—",
      icon: BarChart3,
      trend: avgRR >= 2 ? "up" : avgRR > 0 ? "neutral" : "neutral",
    },
    {
      label: "Total Trades",
      value: totalTrades.toString(),
      icon: TrendingUp,
      trend: "neutral",
    },
    {
      label: "Streak",
      value: streak > 0 ? `${streak}d` : "—",
      icon: Flame,
      trend: streak >= 3 ? "up" : "neutral",
    },
    {
      label: "Best Trade",
      value: bestTrade || "—",
      icon: Trophy,
      trend: bestTrade ? "up" : "neutral",
    },
  ];

  return (
    <div 
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      data-testid="dashboard-kpi-strip"
    >
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          data-testid={`kpi-${kpi.label.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <div className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
            kpi.trend === "up" && "bg-success/10 text-success",
            kpi.trend === "down" && "bg-destructive/10 text-destructive",
            kpi.trend === "neutral" && "bg-muted text-muted-foreground"
          )}>
            <kpi.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
            <p className="text-lg font-semibold truncate">{kpi.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

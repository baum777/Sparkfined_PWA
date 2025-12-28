import { Sparkles } from "lucide-react";
import { useOracle } from "@/features/oracle";
import {
  OracleTodayTakeaway,
  OracleRewardBanner,
  OracleFilters,
  OracleInsightCard,
  OracleEmptyState,
} from "@/components/oracle";

export default function Oracle() {
  const {
    insights,
    filter,
    setFilter,
    counts,
    todayInsight,
    readingStreak,
    markAsRead,
  } = useOracle();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold" data-testid="oracle-heading">
              Oracle
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-powered insights to guide your journey
            </p>
          </div>
        </div>
        <OracleFilters
          filter={filter}
          onFilterChange={setFilter}
          counts={counts}
        />
      </div>

      {/* Today's Takeaway */}
      {todayInsight && <OracleTodayTakeaway insight={todayInsight} />}

      {/* Reward Banner */}
      <OracleRewardBanner streak={readingStreak} />

      {/* Insights List */}
      {insights.length === 0 ? (
        <OracleEmptyState filter={filter} />
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <OracleInsightCard
              key={insight.id}
              insight={insight}
              onMarkAsRead={markAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}

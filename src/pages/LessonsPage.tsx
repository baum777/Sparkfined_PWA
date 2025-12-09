/**
 * LessonsPage - Trading Lessons Library
 *
 * Displays extracted lessons from trade outcomes:
 * - Top lessons by confidence score
 * - Pattern-based filtering
 * - Win rate & sample size stats
 * - Detailed lesson view with DOs/DONTs
 */

import React, { useMemo, useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Toolbar } from '@/components/layout';
import { BookOpen, TrendingUp, Filter } from '@/lib/icons';
import { useLessons } from '@/hooks/useSignals';
import LessonCard from '@/components/signals/LessonCard';
import StateView from '@/components/ui/StateView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function LessonsPage() {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(0.5);

  const { lessons, loading, error } = useLessons();

  const filteredLessons = useMemo(
    () =>
      lessons.filter(
        (lesson) =>
          lesson.score >= minScore && (selectedPattern === null || lesson.pattern === selectedPattern),
      ),
    [lessons, minScore, selectedPattern],
  );

  const patterns = useMemo(() => Array.from(new Set(lessons.map((lesson) => lesson.pattern))), [lessons]);

  const stats = useMemo(() => {
    const total = filteredLessons.length;
    const highScore = filteredLessons.filter((lesson) => lesson.score >= 0.75).length;
    const totalTrades = filteredLessons.reduce((sum, lesson) => sum + (lesson.stats?.trades_analyzed || 0), 0);
    const avgWinRate =
      filteredLessons.length > 0
        ? filteredLessons.reduce((sum, lesson) => sum + (lesson.stats?.win_rate || 0), 0) / filteredLessons.length
        : 0;

    return {
      total,
      highScore,
      avgWinRate,
      totalTrades,
    };
  }, [filteredLessons]);

  const headerDescription = 'Extracted wisdom from your trades with filters for patterns, scores, and progress.';

  return (
    <DashboardShell title="Lessons" description={headerDescription}>
      <div className="space-y-6" data-testid="lessons-page">
        <div className="grid gap-4 lg:grid-cols-12">
          <Card variant="glass" className="lg:col-span-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <BookOpen size={24} aria-hidden />
                </span>
                <div>
                  <CardTitle className="text-2xl">Trading Lessons</CardTitle>
                  <CardDescription>
                    Continue your growth with curated playbooks derived from your trade outcomes and review rituals.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-border/60 bg-surface/60 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-text-tertiary">Total</p>
                  <p className="text-xl font-semibold text-text-primary">{stats.total}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-surface/60 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-text-tertiary">High score</p>
                  <p className="text-xl font-semibold text-sentiment-bull">{stats.highScore}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-surface/60 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-text-tertiary">Avg WR</p>
                  <p className="text-xl font-semibold text-info">{(stats.avgWinRate * 100).toFixed(0)}%</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-surface/60 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-text-tertiary">Trades</p>
                  <p className="text-xl font-semibold text-text-primary">{stats.totalTrades}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="muted" className="lg:col-span-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-brand" aria-hidden />
                <CardTitle className="text-lg">How Lessons Work</CardTitle>
              </div>
              <CardDescription>
                Lessons unlock after you log patterns consistently. They summarize what works, what fails, and how to improve.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-text-secondary">
              <div className="flex items-center gap-2 text-text-primary">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface">💡</span>
                <span>Review insights before each session to stay aligned with your playbook.</span>
              </div>
              <div className="flex items-center gap-2 text-text-primary">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface">📈</span>
                <span>Track the win rate impact of each lesson and refine filters as you progress.</span>
              </div>
              <a className="btn btn-primary btn-sm rounded-full" href="/chart-v2">
                Analyze Your Next Chart
              </a>
            </CardContent>
          </Card>
        </div>

        <Toolbar
          className="bg-surface/80"
          left={
            <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <Filter size={16} aria-hidden />
              Filters
            </div>
          }
          right={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={selectedPattern === null ? 'primary' : 'outline'}
                size="sm"
                className="rounded-full"
                onClick={() => setSelectedPattern(null)}
              >
                All Patterns
              </Button>
              {patterns.map((pattern) => (
                <Button
                  key={pattern}
                  variant={selectedPattern === pattern ? 'primary' : 'outline'}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSelectedPattern(pattern)}
                >
                  {pattern
                    .split('-')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </Button>
              ))}
            </div>
          }
        />

        <Card variant="bordered" className="space-y-4">
          <CardHeader>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Lesson Library</CardTitle>
                <CardDescription>Filter by pattern and minimum confidence to focus on what matters.</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="rounded-full bg-surface px-3 py-1 font-medium text-text-primary">
                  Min Score: {(minScore * 100).toFixed(0)}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={minScore}
                  onChange={(event) => setMinScore(parseFloat(event.target.value))}
                  className="accent-brand"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <StateView type="loading" description="Loading lessons..." />
            ) : error ? (
              <StateView type="error" description="Failed to load lessons" />
            ) : filteredLessons.length === 0 ? (
              <StateView
                type="empty"
                description="No lessons yet. Trade more to accumulate wisdom!"
                icon={<BookOpen size={48} className="text-text-tertiary" />}
              />
            ) : (
              <div className="space-y-4">
                {filteredLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            )}

            {lessons.length === 0 && !loading ? (
              <div className="mt-2 flex flex-col items-center gap-3 text-center">
                <p className="text-sm text-text-secondary">
                  Start detecting signals and tracking trades to build your lesson library.
                </p>
                <a className="btn btn-primary rounded-full" href="/chart-v2">
                  Analyze Your First Chart
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

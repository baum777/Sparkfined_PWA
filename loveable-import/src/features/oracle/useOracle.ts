import { useState, useMemo, useCallback } from 'react';
import type { OracleInsight, OracleFilter } from './types';

const MOCK_INSIGHTS: OracleInsight[] = [
  {
    id: '1',
    title: 'Risk Management Pattern Detected',
    summary: 'Your recent trades show improved position sizing consistency.',
    takeaway: 'Keep sizing at 1-2% per trade to maintain this momentum.',
    content: 'Analysis of your last 10 trades shows position sizing variance decreased by 40%. This discipline correlates with reduced drawdown periods.',
    theme: 'risk',
    isRead: false,
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Entry Timing Observation',
    summary: 'Morning session entries outperform afternoon by 12%.',
    takeaway: 'Consider focusing your active trading on the first 2 hours.',
    content: 'Pattern analysis reveals your win rate peaks during 9:30-11:30 AM. Afternoon trades show higher emotional variance.',
    theme: 'strategy',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: '3',
    title: 'Discipline Milestone',
    summary: 'You followed your trading plan on 8 of 10 recent trades.',
    takeaway: 'Your plan adherence is building the foundation for mastery.',
    content: 'Consistent plan execution is the bridge from reactive trading to intentional trading. Keep logging your decisions.',
    theme: 'discipline',
    isRead: true,
    createdAt: new Date(Date.now() - 172800000),
  },
];

export function useOracle() {
  const [insights, setInsights] = useState<OracleInsight[]>(MOCK_INSIGHTS);
  const [filter, setFilter] = useState<OracleFilter>('all');

  const counts = useMemo(() => ({
    all: insights.length,
    new: insights.filter(i => !i.isRead).length,
    read: insights.filter(i => i.isRead).length,
  }), [insights]);

  const filteredInsights = useMemo(() => {
    switch (filter) {
      case 'new':
        return insights.filter(i => !i.isRead);
      case 'read':
        return insights.filter(i => i.isRead);
      default:
        return insights;
    }
  }, [insights, filter]);

  const todayInsight = useMemo(() => {
    const today = new Date().toDateString();
    return insights.find(i => i.createdAt.toDateString() === today && !i.isRead);
  }, [insights]);

  const readingStreak = useMemo(() => {
    return insights.filter(i => i.isRead).length;
  }, [insights]);

  const markAsRead = useCallback((id: string) => {
    setInsights(prev => prev.map(i => 
      i.id === id ? { ...i, isRead: true } : i
    ));
  }, []);

  return {
    insights: filteredInsights,
    filter,
    setFilter,
    counts,
    todayInsight,
    readingStreak,
    markAsRead,
  };
}

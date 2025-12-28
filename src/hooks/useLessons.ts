import { useState, useEffect } from 'react';

export interface Lesson {
  id: string;
  title: string;
  category: "Risk Management" | "Psychology" | "Technical Analysis" | "Trade Setup";
  difficulty: number; // 1-5
  isLocked: boolean;
  isCompleted: boolean;
  unlockHint: string;
  applyTip: string;
  drillRoute: "/journal" | "/chart";
}

const DEFAULT_LESSONS: Lesson[] = [
  {
    id: "lesson-1",
    title: "Position Sizing Basics",
    category: "Risk Management",
    difficulty: 1,
    isLocked: false,
    isCompleted: false,
    unlockHint: "Log 3 trades to unlock",
    applyTip: "Never risk more than 2% per trade",
    drillRoute: "/journal",
  },
  {
    id: "lesson-2",
    title: "Stop-Loss Placement",
    category: "Risk Management",
    difficulty: 2,
    isLocked: false,
    isCompleted: false,
    unlockHint: "Complete Position Sizing to unlock",
    applyTip: "Set stops before entry, not after",
    drillRoute: "/chart",
  },
  {
    id: "lesson-3",
    title: "Managing FOMO",
    category: "Psychology",
    difficulty: 3,
    isLocked: true,
    isCompleted: false,
    unlockHint: "Log 5 trades to unlock",
    applyTip: "Wait for your setup, skip the chase",
    drillRoute: "/journal",
  },
  {
    id: "lesson-4",
    title: "Support & Resistance",
    category: "Technical Analysis",
    difficulty: 2,
    isLocked: true,
    isCompleted: false,
    unlockHint: "Complete Stop-Loss lesson to unlock",
    applyTip: "Mark levels before the session starts",
    drillRoute: "/chart",
  },
  {
    id: "lesson-5",
    title: "Breakout Entry Patterns",
    category: "Trade Setup",
    difficulty: 4,
    isLocked: true,
    isCompleted: false,
    unlockHint: "Complete 3 lessons to unlock",
    applyTip: "Volume confirms the breakout",
    drillRoute: "/chart",
  },
  {
    id: "lesson-6",
    title: "Revenge Trading Prevention",
    category: "Psychology",
    difficulty: 5,
    isLocked: true,
    isCompleted: false,
    unlockHint: "Log 10 trades to unlock",
    applyTip: "Take a break after 2 losses in a row",
    drillRoute: "/journal",
  },
];

const STORAGE_KEY = "sparkfined_lessons_progress";

export type SortOption = "newest" | "difficulty-asc" | "difficulty-desc";

export function useLessons() {
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // Merge stored state (isCompleted/isLocked) with default content
        const storedState: Record<string, Partial<Lesson>> = JSON.parse(stored);
        return DEFAULT_LESSONS.map(l => ({
          ...l,
          ...storedState[l.id]
        }));
      }
    } catch {
        // ignore
    }
    return DEFAULT_LESSONS;
  });

  const toggleLesson = (id: string) => {
      setLessons(prev => {
          const next = prev.map(l => l.id === id ? { ...l, isCompleted: !l.isCompleted } : l);
          // Persist logic
          const stateToSave = next.reduce((acc, l) => {
              acc[l.id] = { isCompleted: l.isCompleted, isLocked: l.isLocked };
              return acc;
          }, {} as Record<string, Partial<Lesson>>);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
          return next;
      });
  };

  return {
    lessons,
    categories: ["Risk Management", "Psychology", "Technical Analysis", "Trade Setup"] as const,
    unlockedCount: lessons.filter((l) => !l.isLocked).length,
    totalCount: lessons.length,
    toggleLesson
  };
}

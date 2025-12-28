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

const LESSONS: Lesson[] = [
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

export type SortOption = "newest" | "difficulty-asc" | "difficulty-desc";

export function useLessons() {
  return {
    lessons: LESSONS,
    categories: ["Risk Management", "Psychology", "Technical Analysis", "Trade Setup"] as const,
    unlockedCount: LESSONS.filter((l) => !l.isLocked).length,
    totalCount: LESSONS.length,
  };
}

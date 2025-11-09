/**
 * @deprecated Use JournalEntry from @/types/journal instead
 * This type is kept for backward compatibility only
 */
export type JournalNote = {
  id: string;
  title: string;
  body: string;                 // plain/markdown-ish
  tags: string[];
  createdAt: number;
  updatedAt: number;
  // attachments
  screenshotDataUrl?: string;   // PNG (Chart+HUD)
  permalink?: string;           // ?chart=...
  address?: string;             // optional CA context
  tf?: string;
};

// Re-export unified types
export type { JournalEntry, SetupTag, EmotionTag } from "@/types/journal";

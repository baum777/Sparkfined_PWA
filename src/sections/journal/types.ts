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

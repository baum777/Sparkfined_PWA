export type JournalNote = {
  id: string;
  createdAt: number;
  updatedAt: number;
  title?: string;
  body: string;
  address?: string; // CA
  tf?: "1m"|"5m"|"15m"|"1h"|"4h"|"1d";
  ruleId?: string;  // optional Link zu Server/Local Rule
  tags?: string[];
  aiAttachedAt?: number; // wenn AI-Analyse angehängt wurde
};

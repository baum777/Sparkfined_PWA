export interface OracleInsight {
  id: string;
  title: string;
  summary: string;
  takeaway: string;
  content: string;
  theme: 'risk' | 'discipline' | 'strategy' | 'mindset';
  isRead: boolean;
  createdAt: Date;
}

export type OracleFilter = 'all' | 'new' | 'read';

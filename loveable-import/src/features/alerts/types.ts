export type AlertStatus = 'active' | 'triggered' | 'paused';

export interface Alert {
  id: string;
  symbol: string;
  condition: string;
  targetPrice: number;
  status: AlertStatus;
  createdAt: Date;
}

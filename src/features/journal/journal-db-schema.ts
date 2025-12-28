import Dexie, { Table } from 'dexie';

// Type definitions matching the prompt's implied schema
export interface JournalEntry {
  id: string; // UUID
  status: 'active' | 'archived' | 'expired';
  
  // Grouping keys
  tokenMint: string;
  wallet: string;
  
  // Time window
  firstTxTime: number; // Unix timestamp
  lastTxTime: number;
  expiryTime: number; // firstTxTime + 24h usually
  
  // Metrics
  direction: 'long' | 'short' | 'mixed';
  totalBuyAmount: number;
  totalSellAmount: number;
  totalBuyUsd: number;
  totalSellUsd: number;
  
  // PnL (for archived/exited)
  realizedPnl: number | null;
  
  // Transactions belonging to this entry
  txSignatures: string[]; 
  
  createdAt: string;
  updatedAt: string;
  
  // User annotations
  notes?: string;
  tags?: string[];
}

export interface TxEventRecord {
  signature: string;
  wallet: string;
  blockTime: number;
  tokenMint: string;
  type: 'BUY' | 'SELL';
  amountToken: number;
  amountUsd: number | null;
  priceUsd: number | null;
  // stored locally to prevent re-processing
}

export class JournalDatabase extends Dexie {
  entries!: Table<JournalEntry>;
  txEvents!: Table<TxEventRecord>;

  constructor() {
    super('SparkfinedJournalDB');
    this.version(1).stores({
      entries: 'id, status, [wallet+tokenMint], firstTxTime', // indexes
      txEvents: 'signature, [wallet+tokenMint], blockTime' 
    });
  }
}

export const db = new JournalDatabase();

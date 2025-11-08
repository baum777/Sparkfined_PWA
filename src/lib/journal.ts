// Zeitrahmen für Chart-Analysen
export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w";

// Trading Status für Journal-Einträge
export type TradeStatus = "idea" | "entered" | "running" | "winner" | "loser" | "breakeven" | "cancelled";

// Erweiterte Journal-Note mit Trading-spezifischen Feldern
export type JournalNote = {
  // Basis-Felder
  id: string;
  createdAt: number;
  updatedAt: number;
  title?: string;
  body: string;
  tags?: string[];
  
  // Chart & Kontext
  address?: string;           // Contract Address (CA)
  tf?: Timeframe;            // Timeframe der Analyse
  ruleId?: string;           // Link zu Trading-Rule
  screenshotDataUrl?: string; // Chart Screenshot (Data URL)
  permalink?: string;        // Link zurück zum Chart
  
  // Trading-spezifische Felder
  status?: TradeStatus;      // Status des Trades
  entryPrice?: number;       // Einstiegspreis
  exitPrice?: number;        // Ausstiegspreis
  positionSize?: number;     // Positionsgröße (z.B. in USD)
  stopLoss?: number;         // Stop-Loss Preis
  takeProfit?: number;       // Take-Profit Preis
  pnl?: number;              // Profit & Loss (in USD oder %)
  pnlPercent?: number;       // PnL in Prozent
  riskRewardRatio?: number;  // Risk/Reward Verhältnis
  setup?: string;            // Trading Setup/Strategie Name
  
  // AI & Automatisierung
  aiAttachedAt?: number;     // Timestamp wenn AI-Analyse angehängt wurde
  
  // Metadata für erweiterte Funktionen
  enteredAt?: number;        // Timestamp Einstieg
  exitedAt?: number;         // Timestamp Ausstieg
};

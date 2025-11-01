export type Bookmark = {
  id: string;
  t: number;            // unix ms (aus OHLC.t)
  label?: string;
  createdAt: number;
};

export type ReplayState = {
  isPlaying: boolean;
  speed: 1 | 2 | 4 | 8 | 10;  // bars/sec
  cursor: number;             // aktueller Index im Datenarray
};

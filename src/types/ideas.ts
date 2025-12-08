export type IdeaTimeframe = 'scalp' | 'intraday' | 'swing' | 'position';
export type IdeaConfidence = 'low' | 'medium' | 'high';

export interface IdeaPacket {
  id: string;
  title: string;
  thesis: string;
  timeframe: IdeaTimeframe;
  confidence: IdeaConfidence;
  updatedAt: number;
  createdAt?: number;
}

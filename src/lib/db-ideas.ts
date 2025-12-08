import Dexie, { type Table } from 'dexie';
import type { IdeaPacket } from '@/types/ideas';

export type IdeaPacketRecord = IdeaPacket & { createdAt: number };

export class IdeaDatabase extends Dexie {
  ideaPackets!: Table<IdeaPacketRecord, string>;

  constructor() {
    super('sparkfined-ideas');

    this.version(1).stores({
      ideaPackets: 'id, updatedAt, timeframe, confidence',
    });
  }
}

export const ideaDB = new IdeaDatabase();

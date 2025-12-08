import type { IdeaConfidence, IdeaPacket, IdeaTimeframe } from '@/types/ideas';
import { ideaDB, type IdeaPacketRecord } from './db-ideas';

const IDEA_STORAGE_KEY = 'sparkfined_idea_packets';
const IDEA_MIGRATION_FLAG = 'sparkfined_idea_packets_migrated';

type IdeaPacketInput = Partial<IdeaPacket> & {
  title?: string;
  thesis?: string;
  timeframe?: IdeaTimeframe | string;
  confidence?: IdeaConfidence | string;
};

type NewIdeaPacket = Pick<IdeaPacket, 'title' | 'thesis' | 'timeframe' | 'confidence'>;

const ALLOWED_TIMEFRAMES: IdeaTimeframe[] = ['scalp', 'intraday', 'swing', 'position'];
const ALLOWED_CONFIDENCE: IdeaConfidence[] = ['low', 'medium', 'high'];
let lastUpdatedAt = 0;

function resolveUpdatedAt(value?: number): number {
  if (typeof value === 'number') {
    lastUpdatedAt = Math.max(lastUpdatedAt, value);
    return value;
  }

  const now = Date.now();
  if (now <= lastUpdatedAt) {
    lastUpdatedAt += 1;
    return lastUpdatedAt;
  }

  lastUpdatedAt = now;
  return now;
}

function normalizeTimeframe(value?: string): IdeaTimeframe {
  if (value && ALLOWED_TIMEFRAMES.includes(value as IdeaTimeframe)) {
    return value as IdeaTimeframe;
  }
  return 'swing';
}

function normalizeConfidence(value?: string): IdeaConfidence {
  if (value && ALLOWED_CONFIDENCE.includes(value as IdeaConfidence)) {
    return value as IdeaConfidence;
  }
  return 'medium';
}

function normalizeIdeaPacket(input: IdeaPacketInput, fallbackId?: string, now = Date.now()): IdeaPacketRecord {
  const title = (input.title ?? '').trim() || 'Untitled idea';
  const thesis = (input.thesis ?? '').trim() || '';
  const updatedAt = resolveUpdatedAt(typeof input.updatedAt === 'number' ? input.updatedAt : now);
  const createdAt = typeof input.createdAt === 'number' ? input.createdAt : updatedAt;
  const id = input.id ?? fallbackId ?? crypto.randomUUID();

  return {
    id,
    title,
    thesis,
    timeframe: normalizeTimeframe(input.timeframe),
    confidence: normalizeConfidence(input.confidence),
    updatedAt,
    createdAt,
  };
}

export async function getAllIdeaPackets(): Promise<IdeaPacket[]> {
  return ideaDB.ideaPackets.orderBy('updatedAt').reverse().toArray();
}

export async function getIdeaPacketById(id: string): Promise<IdeaPacket | undefined> {
  return ideaDB.ideaPackets.get(id);
}

export async function createIdeaPacket(input: NewIdeaPacket): Promise<IdeaPacket> {
  const timestamp = resolveUpdatedAt();
  const record = normalizeIdeaPacket({ ...input, createdAt: timestamp, updatedAt: timestamp }, undefined, timestamp);
  await ideaDB.ideaPackets.add(record);
  return record;
}

export async function updateIdeaPacket(
  id: string,
  patch: Partial<Omit<IdeaPacket, 'id'>>
): Promise<IdeaPacket | undefined> {
  const existing = await ideaDB.ideaPackets.get(id);
  if (!existing) return undefined;

  const updated = normalizeIdeaPacket(
    { ...existing, ...patch, updatedAt: patch.updatedAt ?? resolveUpdatedAt() },
    existing.id
  );

  await ideaDB.ideaPackets.put(updated);
  return updated;
}

export async function removeIdeaPacket(id: string): Promise<void> {
  await ideaDB.ideaPackets.delete(id);
}

export async function replaceIdeaPackets(packets: IdeaPacketInput[]): Promise<IdeaPacket[]> {
  await ideaDB.ideaPackets.clear();
  if (packets.length === 0) return [];

  const now = Date.now();
  const normalized = packets.map((packet) => normalizeIdeaPacket(packet, packet.id, now));
  await ideaDB.ideaPackets.bulkPut(normalized);
  return getAllIdeaPackets();
}

export async function migrateIdeaPacketsFromLocalStorage(): Promise<void> {
  if (typeof localStorage === 'undefined') return;
  if (localStorage.getItem(IDEA_MIGRATION_FLAG) === 'true') return;

  try {
    const raw = localStorage.getItem(IDEA_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as IdeaPacketInput[] | null) : [];
    const existingIds = new Set((await ideaDB.ideaPackets.toArray()).map((idea) => idea.id));

    const normalized = Array.isArray(parsed)
      ? parsed
          .map((item) => normalizeIdeaPacket(item))
          .filter((idea) => !existingIds.has(idea.id))
      : [];

    if (normalized.length > 0) {
      await ideaDB.ideaPackets.bulkPut(normalized);
    }

    localStorage.setItem(IDEA_MIGRATION_FLAG, 'true');
    localStorage.removeItem(IDEA_STORAGE_KEY);
  } catch (error) {
    console.warn('[ideas] migration failed, continuing with Dexie defaults', error);
    localStorage.setItem(IDEA_MIGRATION_FLAG, 'true');
  }
}

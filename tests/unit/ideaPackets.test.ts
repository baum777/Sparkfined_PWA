import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createIdeaPacket,
  getAllIdeaPackets,
  getIdeaPacketById,
  migrateIdeaPacketsFromLocalStorage,
  removeIdeaPacket,
  replaceIdeaPackets,
  updateIdeaPacket,
} from '@/lib/ideaPackets';
import { ideaDB } from '@/lib/db-ideas';
import type { IdeaPacket } from '@/types/ideas';

const uuidA = '11111111-1111-1111-1111-111111111111';
const uuidB = '22222222-2222-2222-2222-222222222222';

vi.mock('@/lib/db-ideas', () => {
  const store = new Map<string, IdeaPacket>();

  const ideaPackets = {
    async add(idea: IdeaPacket): Promise<string> {
      store.set(idea.id, idea);
      return idea.id;
    },
    async bulkPut(ideas: IdeaPacket[]): Promise<void> {
      ideas.forEach((idea) => store.set(idea.id, idea));
    },
    async put(idea: IdeaPacket): Promise<string> {
      store.set(idea.id, idea);
      return idea.id;
    },
    async delete(id: string): Promise<void> {
      store.delete(id);
    },
    async get(id: string): Promise<IdeaPacket | undefined> {
      return store.get(id);
    },
    async clear(): Promise<void> {
      store.clear();
    },
    async toArray(): Promise<IdeaPacket[]> {
      return Array.from(store.values());
    },
    orderBy(field: keyof IdeaPacket) {
      return {
        reverse() {
          return this;
        },
        async toArray(): Promise<IdeaPacket[]> {
          const sorted = Array.from(store.values()).sort((a, b) => {
            const av = a[field] as number;
            const bv = b[field] as number;
            return bv - av;
          });
          return sorted;
        },
      };
    },
  };

  return { ideaDB: { ideaPackets } };
});

describe('ideaPackets repository', () => {
  beforeEach(async () => {
    await ideaDB.ideaPackets.clear();
    localStorage.clear();
  });

  it('creates and retrieves idea packets in updated order', async () => {
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValueOnce(uuidA).mockReturnValueOnce(uuidB);

    await createIdeaPacket({
      title: 'First',
      thesis: 'First thesis',
      timeframe: 'swing',
      confidence: 'medium',
    });

    await createIdeaPacket({
      title: 'Second',
      thesis: 'Second thesis',
      timeframe: 'intraday',
      confidence: 'high',
    });

    const all = await getAllIdeaPackets();
    expect(all).toHaveLength(2);
    expect(all[0]!.title).toBe('Second');
    expect(all[1]!.title).toBe('First');
  });

  it('updates an existing idea packet', async () => {
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(uuidA);

    const created = await createIdeaPacket({
      title: 'Range play',
      thesis: 'Mean reversion',
      timeframe: 'swing',
      confidence: 'medium',
    });

    const updated = await updateIdeaPacket(created.id, { confidence: 'high', thesis: 'Updated thesis' });

    expect(updated?.confidence).toBe('high');
    expect(updated?.thesis).toBe('Updated thesis');

    const fetched = await getIdeaPacketById(created.id);
    expect(fetched?.confidence).toBe('high');
  });

  it('removes an idea packet', async () => {
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(uuidA);

    const created = await createIdeaPacket({
      title: 'To be removed',
      thesis: 'Temporary',
      timeframe: 'position',
      confidence: 'low',
    });

    await removeIdeaPacket(created.id);
    const all = await getAllIdeaPackets();
    expect(all).toHaveLength(0);
  });

  it('migrates existing localStorage data once', async () => {
    const legacyIdeas = [
      {
        id: 'legacy-1',
        title: 'Legacy idea',
        thesis: 'Carry over',
        timeframe: 'swing',
        confidence: 'medium',
        updatedAt: 100,
      },
    ];

    localStorage.setItem('sparkfined_idea_packets', JSON.stringify(legacyIdeas));

    await migrateIdeaPacketsFromLocalStorage();
    const all = await getAllIdeaPackets();

    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe('legacy-1');
    expect(localStorage.getItem('sparkfined_idea_packets_migrated')).toBe('true');
    expect(localStorage.getItem('sparkfined_idea_packets')).toBeNull();

    await migrateIdeaPacketsFromLocalStorage();
    const afterSecondRun = await getAllIdeaPackets();
    expect(afterSecondRun).toHaveLength(1);
  });

  it('replaces ideas when syncing from server', async () => {
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValueOnce(uuidA).mockReturnValueOnce(uuidB);

    await createIdeaPacket({
      title: 'Local idea',
      thesis: 'keep',
      timeframe: 'intraday',
      confidence: 'medium',
    });

    const synced = await replaceIdeaPackets([
      { id: uuidB, title: 'Remote idea', thesis: 'synced', updatedAt: 200 },
    ]);

    expect(synced).toHaveLength(1);
    expect(synced[0]?.id).toBe(uuidB);
  });
});

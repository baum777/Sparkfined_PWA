export const kv = {
  get: async <T = unknown>(_key: string): Promise<T | null> => null,
  set: async (): Promise<void> => undefined,
  rpush: async (): Promise<void> => undefined,
  incr: async (): Promise<number> => 1,
  expire: async (): Promise<void> => undefined,
};

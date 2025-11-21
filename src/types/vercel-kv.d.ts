declare module "@vercel/kv" {
  export const kv: {
    get<T = unknown>(key: string): Promise<T | null>;
    set(key: string, value: unknown, options?: { ex?: number }): Promise<unknown>;
    incr(key: string): Promise<number>;
    expire(key: string, ttl: number): Promise<unknown>;
    lpush(key: string, value: unknown): Promise<number>;
  };
}

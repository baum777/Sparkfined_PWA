declare module "@vercel/kv" {
  export const kv: {
    get<T = unknown>(key: string): Promise<T | null>;
    set(key: string, value: unknown, options?: { ex?: number }): Promise<unknown>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    rpush(key: string, value: unknown): Promise<number>;
  };
}

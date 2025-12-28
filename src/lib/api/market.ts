interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface RequestConfig {
  ttl?: number; // ms
  retries?: number;
}

class MarketService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private inflight = new Map<string, Promise<unknown>>();
  private baseUrl = "https://api.coingecko.com/api/v3";
  private defaultTTL = 60000; // 1 min

  private idMap: Record<string, string> = {
    'SOL': 'solana',
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'JUP': 'jupiter-exchange-solana',
  };

  private async fetchWithBackoff(url: string, retries = 3, delay = 1000): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        const wait = retryAfter ? parseInt(retryAfter) * 1000 : delay * 2;
        if (retries > 0) {
          await new Promise(r => setTimeout(r, wait));
          return this.fetchWithBackoff(url, retries - 1, wait * 2);
        }
      }

      if (!res.ok && retries > 0 && res.status >= 500) {
        await new Promise(r => setTimeout(r, delay));
        return this.fetchWithBackoff(url, retries - 1, delay * 2);
      }

      return res;
    } catch (err) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, delay));
        return this.fetchWithBackoff(url, retries - 1, delay * 2);
      }
      throw err;
    }
  }

  private async get<T>(key: string, url: string, config: RequestConfig = {}): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);
    const ttl = config.ttl ?? this.defaultTTL;

    if (cached && (now - cached.timestamp < ttl)) {
      return cached.data as T;
    }

    if (this.inflight.has(key)) {
      return this.inflight.get(key) as Promise<T>;
    }

    const request = this.fetchWithBackoff(url, config.retries)
      .then(async res => {
        if (!res.ok) throw new Error(`Market API Error: ${res.statusText}`);
        const data = await res.json();
        this.cache.set(key, { data, timestamp: Date.now() });
        return data;
      })
      .catch(err => {
        console.error(`Market API fetch failed for ${key}:`, err);
        // Return stale data if available on error
        if (cached) return cached.data;
        throw err;
      })
      .finally(() => {
        this.inflight.delete(key);
      });

    this.inflight.set(key, request);
    return request as Promise<T>;
  }

  async getPrice(symbol: string): Promise<number> {
    const id = this.idMap[symbol.toUpperCase()] || symbol.toLowerCase();
    const key = `price:${id}`;
    const url = `${this.baseUrl}/simple/price?ids=${id}&vs_currencies=usd`;
    
    try {
      const data = await this.get<{ [key: string]: { usd: number } }>(key, url, { ttl: 30000 });
      return data[id]?.usd || 0;
    } catch {
      return 0;
    }
  }

  async getOHLC(symbol: string, timeframe: string): Promise<unknown[]> {
    // Placeholder - just ensures the method signature exists and is safe
    // const key = `ohlc:${symbol}:${timeframe}`;
    // Real impl would map timeframe to API params
    console.warn('OHLC fetch not fully implemented for', symbol, timeframe);
    return [];
  }
}

export const marketApi = new MarketService();

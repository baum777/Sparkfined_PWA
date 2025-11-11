/**
 * Providers Configuration
 * Centralized API provider settings for backend endpoints
 */

export const Providers = {
  dexpaprika: {
    base: process.env.DEXPAPRIKA_BASE || 'https://api.dexpaprika.com',
    headers: (): Record<string, string> => {
      const key = process.env.DEXPAPRIKA_API_KEY || '';
      return key ? { 'X-API-Key': key } : {};
    }
  },
  moralis: {
    base: process.env.MORALIS_BASE || 'https://deep-index.moralis.io/api/v2.2',
    headers: (): Record<string, string> => {
      const key = process.env.MORALIS_API_KEY || '';
      return key ? { 'X-API-Key': key } : {};
    }
  }
};

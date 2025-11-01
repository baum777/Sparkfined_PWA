/**
 * Providers Configuration
 * Centralized API provider settings for backend endpoints
 */

export const Providers = {
  dexpaprika: {
    base: process.env.DEXPAPRIKA_BASE || 'https://api.dexpaprika.com',
    headers: () => {
      const key = process.env.DEXPAPRIKA_API_KEY || '';
      return key ? { 'Authorization': `Bearer ${key}` } : {};
    }
  }
};

/**
 * Asset Loading Debug Utility
 * Helps diagnose PWA load failures by checking if critical assets are loaded
 * 
 * Usage: Call in main.tsx or App.tsx (only in preview/production)
 */

import { ENV } from '@/config/env';

export interface AssetCheckResult {
  url: string;
  status: 'ok' | 'failed' | 'timeout';
  statusCode?: number;
  contentType?: string;
  error?: string;
}

/**
 * Check if a critical asset is accessible
 */
export async function checkAsset(url: string, timeout = 5000): Promise<AssetCheckResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store', // Bypass cache for diagnostic
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';

    return {
      url,
      status: response.ok ? 'ok' : 'failed',
      statusCode: response.status,
      contentType,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { url, status: 'timeout', error: 'Request timeout' };
      }
      return { url, status: 'failed', error: error.message };
    }
    return { url, status: 'failed', error: 'Unknown error' };
  }
}

/**
 * Check all critical assets for PWA load
 * Returns array of results, logs to console in preview mode
 */
export async function checkCriticalAssets(baseUrl = ''): Promise<AssetCheckResult[]> {
  const isPreview = ENV.VERCEL_ENV === 'preview';
  const isProd = ENV.PROD;

  if (!isPreview && !isProd) {
    // Skip in dev mode
    return [];
  }

  // Get CSS/JS from current page
  const cssLinks = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
    .map(link => link.href)
    .filter(href => href.includes('/assets/'));

  const jsScripts = Array.from(document.querySelectorAll<HTMLScriptElement>('script[type="module"]'))
    .map(script => script.src)
    .filter(src => src && src.includes('/assets/'));

  const criticalAssets = [
    '/manifest.webmanifest',
    ...cssLinks,
    ...jsScripts,
  ].filter(Boolean);

  const results = await Promise.all(
    criticalAssets.map(url => checkAsset(url))
  );

  // Log results in preview mode
  if (isPreview) {
    const failed = results.filter(r => r.status !== 'ok');
    if (failed.length > 0) {
      console.error('[Asset Check] ❌ Failed assets:', failed);
      console.error('[Asset Check] This may cause black screen / missing styles');
    } else {
      console.log('[Asset Check] ✅ All critical assets loaded successfully');
    }
  }

  return results;
}

/**
 * Auto-check assets after page load (only in preview/prod)
 */
export function autoCheckAssets() {
  if (typeof window === 'undefined') return;

  const isPreview = ENV.VERCEL_ENV === 'preview';
  const isProd = ENV.PROD;

  if (!isPreview && !isProd) return;

  // Wait for page to be fully loaded
  if (document.readyState === 'complete') {
    setTimeout(() => checkCriticalAssets(), 1000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => checkCriticalAssets(), 1000);
    });
  }
}

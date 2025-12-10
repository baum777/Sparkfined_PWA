/**
 * Chart Colors Utility
 * 
 * Converts CSS design tokens to RGB/Hex strings for chart libraries
 * (e.g., LightweightCharts, TradingView) that don't support CSS variables.
 * 
 * @example
 * ```ts
 * const colors = getChartColors();
 * chart.applyOptions({
 *   layout: {
 *     background: { color: colors.background },
 *     textColor: colors.textColor,
 *   }
 * });
 * ```
 */

const FALLBACK_RGB = 'rgb(0, 0, 0)';
const missingTokenWarnings = new Set<string>();
const invalidValueWarnings = new Set<string>();

/**
 * Get computed RGB value from a CSS variable
 * @param token - CSS variable name (e.g., '--color-brand')
 * @returns RGB string (e.g., 'rgb(15, 179, 76)')
 */
function getTokenValue(token: string): string {
  if (typeof window === 'undefined') {
    // SSR fallback (should not happen in chart context, but defensive)
    return FALLBACK_RGB;
  }

  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue(token).trim();

  if (!value) {
    if (!missingTokenWarnings.has(token)) {
      console.warn(`[chartColors] Token "${token}" not found, using fallback`);
      missingTokenWarnings.add(token);
    }
    return FALLBACK_RGB;
  }

  // Convert "15 179 76" to "rgb(15, 179, 76)"
  const parts = value.split(' ').map(Number);
  const [r = 0, g = 0, b = 0] = parts;

  if (isNaN(r) || isNaN(g) || isNaN(b) || parts.length !== 3) {
    if (!invalidValueWarnings.has(token)) {
      console.warn(`[chartColors] Invalid RGB value for token "${token}": "${value}"`);
      invalidValueWarnings.add(token);
    }
    return FALLBACK_RGB;
  }

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Get chart colors from design tokens
 * 
 * All colors are derived from CSS custom properties defined in tokens.css
 * and will automatically adapt to theme changes (dark/light/OLED).
 */
export function getChartColors() {
  return {
    // Background & Surface
    background: getTokenValue('--color-bg-elevated'),
    surface: getTokenValue('--color-surface'),
    surfaceElevated: getTokenValue('--color-surface-elevated'),

    // Text
    textColor: getTokenValue('--color-text-secondary'),
    textPrimary: getTokenValue('--color-text-primary'),
    textTertiary: getTokenValue('--color-text-tertiary'),

    // Borders & Grid
    border: getTokenValue('--color-border'),
    gridColor: getTokenValue('--color-border'),

    // Trading Sentiment
    bullColor: getTokenValue('--color-sentiment-bull'),
    bearColor: getTokenValue('--color-sentiment-bear'),
    neutralColor: getTokenValue('--color-sentiment-neutral'),

    // Semantic Colors
    success: getTokenValue('--color-success'),
    danger: getTokenValue('--color-danger'),
    info: getTokenValue('--color-info'),
    warn: getTokenValue('--color-warn'),

    // Brand
    brand: getTokenValue('--color-brand'),
    accent: getTokenValue('--color-accent'),
    cyan: getTokenValue('--color-cyan'),
  };
}

/**
 * Chart colors type (for type safety)
 */
export type ChartColors = ReturnType<typeof getChartColors>;

/**
 * Get chart color with fallback
 * @param token - CSS variable name
 * @param fallback - Fallback hex color if token not found
 */
export function getChartColor(token: string, fallback: string): string {
  try {
    return getTokenValue(token);
  } catch {
    return fallback;
  }
}

/**
 * Cached chart colors (refreshed on theme change)
 * 
 * Use this for performance-critical scenarios where colors
 * don't need to be re-computed on every render.
 */
let cachedColors: ChartColors | null = null;

export function getCachedChartColors(): ChartColors {
  if (!cachedColors) {
    cachedColors = getChartColors();
  }
  return cachedColors;
}

/**
 * Clear cached colors (call when theme changes)
 */
export function clearChartColorCache(): void {
  cachedColors = null;
}

/**
 * Subscribe to theme changes and clear cache automatically
 * 
 * @example
 * ```ts
 * // In your chart component mount:
 * const unsubscribe = subscribeToThemeChanges();
 * 
 * // Cleanup on unmount:
 * return () => unsubscribe();
 * ```
 */
export function subscribeToThemeChanges(): () => void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === 'attributes' &&
        (mutation.attributeName === 'data-theme' ||
         mutation.attributeName === 'data-oled')
      ) {
        clearChartColorCache();
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-oled'],
  });

  // Cleanup function
  return () => {
    observer.disconnect();
  };
}

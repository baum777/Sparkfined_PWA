/**
 * Layout-Stil Toggle (Rund/Eckig + OLED)
 * 
 * Usage:
 * import { initializeLayoutToggles, setLayoutStyle, setOledMode } from '@/lib/layout-toggle';
 * 
 * // On app load (main.tsx):
 * initializeLayoutToggles();
 * 
 * // In Settings:
 * setLayoutStyle('sharp');
 * setOledMode('on');
 */

export type LayoutStyle = 'rounded' | 'sharp';
export type OledMode = 'on' | 'off';

const LAYOUT_KEY = 'layout_style';
const OLED_KEY = 'oled_mode';

/**
 * Get current layout style from localStorage
 * Default: 'rounded'
 */
export function getLayoutStyle(): LayoutStyle {
  const stored = localStorage.getItem(LAYOUT_KEY);
  return (stored === 'sharp' ? 'sharp' : 'rounded') as LayoutStyle;
}

/**
 * Set layout style and apply to DOM
 * Updates data-layout attribute on body
 */
export function setLayoutStyle(style: LayoutStyle) {
  localStorage.setItem(LAYOUT_KEY, style);
  document.body.setAttribute('data-layout', style);
}

/**
 * Get current OLED mode from localStorage
 * Default: 'off'
 */
export function getOledMode(): OledMode {
  const stored = localStorage.getItem(OLED_KEY);
  return (stored === 'on' ? 'on' : 'off') as OledMode;
}

/**
 * Set OLED mode and apply to DOM
 * Updates data-oled attribute on body
 */
export function setOledMode(mode: OledMode) {
  localStorage.setItem(OLED_KEY, mode);
  document.body.setAttribute('data-oled', mode === 'on' ? 'true' : 'false');
}

/**
 * Initialize layout toggles on app load
 * Reads from localStorage and applies to DOM
 * Call this in main.tsx BEFORE React render
 */
export function initializeLayoutToggles() {
  const layoutStyle = getLayoutStyle();
  const oledMode = getOledMode();
  
  setLayoutStyle(layoutStyle);
  setOledMode(oledMode);
  
  if (import.meta.env.DEV) {
    console.log('[Layout Toggle] Initialized:', { layoutStyle, oledMode });
  }
}

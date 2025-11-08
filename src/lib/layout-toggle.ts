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

import { ENV } from '@/config/env';

export type LayoutStyle = 'rounded' | 'sharp';
export type OledMode = 'on' | 'off';

const LAYOUT_KEY = 'layout_style';
const OLED_KEY = 'oled_mode';

/**
 * Get current layout style from localStorage
 * Default: 'rounded'
 */
export function getLayoutStyle(): LayoutStyle {
  try {
    const stored = localStorage.getItem(LAYOUT_KEY);
    return (stored === 'sharp' ? 'sharp' : 'rounded') as LayoutStyle;
  } catch (error) {
    // localStorage might not be available (SSR, private mode, etc.)
    return 'rounded';
  }
}

/**
 * Set layout style and apply to DOM
 * Updates data-layout attribute on body
 */
export function setLayoutStyle(style: LayoutStyle) {
  try {
    localStorage.setItem(LAYOUT_KEY, style);
  } catch (error) {
    // localStorage might not be available - continue anyway
  }
  if (typeof document !== 'undefined' && document.body) {
    document.body.setAttribute('data-layout', style);
  }
}

/**
 * Get current OLED mode from localStorage
 * Default: 'off'
 */
export function getOledMode(): OledMode {
  try {
    const stored = localStorage.getItem(OLED_KEY);
    return (stored === 'on' ? 'on' : 'off') as OledMode;
  } catch (error) {
    // localStorage might not be available (SSR, private mode, etc.)
    return 'off';
  }
}

/**
 * Set OLED mode and apply to DOM
 * Updates data-oled attribute on body
 */
export function setOledMode(mode: OledMode) {
  try {
    localStorage.setItem(OLED_KEY, mode);
  } catch (error) {
    // localStorage might not be available - continue anyway
  }
  if (typeof document !== 'undefined' && document.body) {
    document.body.setAttribute('data-oled', mode === 'on' ? 'true' : 'false');
  }
}

/**
 * Initialize layout toggles on app load
 * Reads from localStorage and applies to DOM
 * Call this in main.tsx BEFORE React render
 */
export function initializeLayoutToggles() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return; // SSR or non-browser environment
  }

  try {
    const layoutStyle = getLayoutStyle();
    const oledMode = getOledMode();
    
    setLayoutStyle(layoutStyle);
    setOledMode(oledMode);
    
      if (ENV.DEV) {
      console.log('[Layout Toggle] Initialized:', { layoutStyle, oledMode });
    }
  } catch (error) {
    // Don't block app initialization if layout toggle fails
    console.warn('[Layout Toggle] Initialization failed:', error);
  }
}

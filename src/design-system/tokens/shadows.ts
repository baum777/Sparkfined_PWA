export const shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.5)',
  md: '0 4px 8px rgba(0, 0, 0, 0.6)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.7)',
  xl: '0 16px 32px rgba(0, 0, 0, 0.8)',
} as const

export const glows = {
  spark: '0 0 20px rgba(0, 240, 255, 0.25), 0 0 40px rgba(0, 240, 255, 0.25)',
  gold: '0 0 20px rgba(255, 184, 0, 0.2), 0 0 40px rgba(255, 184, 0, 0.2)',
  blood: '0 0 20px rgba(255, 0, 110, 0.2), 0 0 40px rgba(255, 0, 110, 0.2)',
  phosphor: '0 0 20px rgba(57, 255, 20, 0.2), 0 0 40px rgba(57, 255, 20, 0.2)',
} as const

export type DesignSystemShadows = typeof shadows
export type DesignSystemGlows = typeof glows

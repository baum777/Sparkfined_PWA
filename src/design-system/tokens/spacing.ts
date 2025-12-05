export const spacing = {
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.5rem',
  6: '2rem',
  8: '3rem',
  10: '4rem',
  12: '6rem',
} as const

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
} as const

export type SpacingTokens = typeof spacing
export type BorderRadiusTokens = typeof borderRadius

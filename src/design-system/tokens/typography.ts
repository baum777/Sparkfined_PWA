export const typography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'SFMono-Regular', monospace",
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
    sm: ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
    base: ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
    lg: ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],
    xl: ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
    '2xl': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
    '3xl': ['2rem', { lineHeight: '1.25', fontWeight: '700' }],
    '4xl': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
    '5xl': ['3rem', { lineHeight: '1.2', fontWeight: '900' }],
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
    wider: '0.05em',
  },
} as const

export type TypographyTokens = typeof typography

export type FontScaleEntry = [size: string, options: { lineHeight: string; fontWeight: string }]

const toRem = (px: number) => `${px / 16}rem`

export const typography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'SFMono-Regular', monospace",
  },
  fontSize: {
    xs: [toRem(12), { lineHeight: '1.4', fontWeight: '500' }],
    sm: [toRem(14), { lineHeight: '1.5', fontWeight: '400' }],
    base: [toRem(16), { lineHeight: '1.5', fontWeight: '400' }],
    lg: [toRem(18), { lineHeight: '1.5', fontWeight: '500' }],
    xl: [toRem(20), { lineHeight: '1.4', fontWeight: '600' }],
    '2xl': [toRem(24), { lineHeight: '1.3', fontWeight: '600' }],
    '3xl': [toRem(32), { lineHeight: '1.25', fontWeight: '700' }],
    '4xl': [toRem(40), { lineHeight: '1.2', fontWeight: '700' }],
    '5xl': [toRem(48), { lineHeight: '1.2', fontWeight: '900' }],
  } satisfies Record<string, FontScaleEntry>,
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

export type DesignSystemTypography = typeof typography

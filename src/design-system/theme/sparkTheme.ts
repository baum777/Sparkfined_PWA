import {
  animation,
  borderRadius,
  colors,
  glows,
  shadows,
  spacing,
  typography,
} from '../tokens'

export const sparkTheme = {
  name: 'spark',
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  glows,
  animation,
} as const

export type SparkTheme = typeof sparkTheme

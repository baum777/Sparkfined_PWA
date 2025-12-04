import { colors } from '../tokens/colors'
import { typography } from '../tokens/typography'
import { spacing, borderRadius, zIndex } from '../tokens/spacing'
import { shadows, glows } from '../tokens/shadows'
import { animation } from '../tokens/animation'

export const sparkTheme = {
  colors,
  typography,
  spacing,
  borderRadius,
  zIndex,
  shadows,
  glows,
  animation,
} as const

export type SparkTheme = typeof sparkTheme

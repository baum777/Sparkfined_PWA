import { animation } from '../tokens/animation'
import { borderRadius, spacing } from '../tokens/spacing'
import { colors } from '../tokens/colors'
import { glows, shadows } from '../tokens/shadows'
import { typography } from '../tokens/typography'

export const sparkTheme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  glows,
  animation,
} as const

export type SparkTheme = typeof sparkTheme

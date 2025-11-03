/**
 * Constellation UI Types
 * 3D roadmap visualization with interactive stars
 */

export type FeatureStatus = 'planned' | 'in-progress' | 'completed' | 'blocked'

export interface Feature {
  id: string
  name: string
  description: string
  status: FeatureStatus
  priority: number // 1-10
  position: [number, number, number] // [x, y, z]
  dependencies?: string[] // IDs of required features
  tags?: string[]
  sprint?: string
  estimatedHours?: number
}

export interface Dependency {
  from: string // Feature ID
  to: string // Feature ID
  critical: boolean
}

export interface ConstellationTheme {
  background: string
  starColors: {
    planned: string
    'in-progress': string
    completed: string
    blocked: string
  }
  dependencyLine: {
    normal: string
    critical: string
  }
}

export const DEFAULT_THEME: ConstellationTheme = {
  background: '#0A0E27',
  starColors: {
    planned: '#94a3b8', // slate-400
    'in-progress': '#fbbf24', // yellow-400
    completed: '#10b981', // emerald-500
    blocked: '#ef4444', // red-500
  },
  dependencyLine: {
    normal: '#475569', // slate-600
    critical: '#f59e0b', // amber-500
  },
}

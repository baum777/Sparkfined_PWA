/**
 * Constellation UI Types
 * Sparkfined PWA Trading Platform
 */

export interface Feature {
  id: string
  name: string
  description: string
  priority: number
  status: FeatureStatus
  position: [number, number, number] // x, y, z coordinates
  dependencies: string[]
  tags: string[]
}

export type FeatureStatus = 
  | 'planned' 
  | 'in_progress' 
  | 'testing' 
  | 'completed' 
  | 'blocked'

export interface Dependency {
  from: string
  to: string
  critical: boolean
}

export interface ConstellationData {
  features: Feature[]
  dependencies: Dependency[]
}

export const statusColors: Record<FeatureStatus, string> = {
  planned: '#6b7280',      // gray
  in_progress: '#3b82f6',  // blue
  testing: '#f59e0b',      // amber
  completed: '#10b981',    // green
  blocked: '#ef4444'       // red
}

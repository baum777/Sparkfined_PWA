/**
 * Dependency Line Component
 * Connects feature nodes showing dependencies
 * Sparkfined PWA Trading Platform
 */

import { useRef } from 'react'
import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface DependencyLineProps {
  start: [number, number, number]
  end: [number, number, number]
  critical: boolean
  animated?: boolean
}

export function DependencyLine({ start, end, critical, animated = false }: DependencyLineProps) {
  const lineRef = useRef<any>(null)

  useFrame((state) => {
    if (!lineRef.current || !animated) return
    
    // Animate critical dependencies with flowing effect
    const material = lineRef.current.material
    if (material && material.dashOffset !== undefined) {
      material.dashOffset -= 0.01
    }
  })

  const color = critical ? '#ef4444' : '#6b7280' // red for critical, gray for normal
  const opacity = critical ? 0.8 : 0.4

  return (
    <Line
      ref={lineRef}
      points={[start, end]}
      color={color}
      lineWidth={critical ? 2 : 1}
      dashed={animated}
      dashScale={50}
      dashSize={3}
      dashOffset={0}
      transparent
      opacity={opacity}
    />
  )
}

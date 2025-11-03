/**
 * DependencyLine Component
 * Draws a line between dependent features
 */

import { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { DEFAULT_THEME } from '../types'

interface DependencyLineProps {
  start: [number, number, number]
  end: [number, number, number]
  critical?: boolean
}

export function DependencyLine({ start, end, critical = false }: DependencyLineProps) {
  // Calculate curve for more organic look
  const points = useMemo(() => {
    const startVec = new THREE.Vector3(...start)
    const endVec = new THREE.Vector3(...end)
    
    // Midpoint with slight offset upward for curve
    const mid = new THREE.Vector3()
      .addVectors(startVec, endVec)
      .multiplyScalar(0.5)
    
    mid.y += 0.5 // Slight upward curve

    // Create quadratic bezier curve
    const curve = new THREE.QuadraticBezierCurve3(
      startVec,
      mid,
      endVec
    )

    return curve.getPoints(20)
  }, [start, end])

  const color = critical
    ? DEFAULT_THEME.dependencyLine.critical
    : DEFAULT_THEME.dependencyLine.normal

  return (
    <Line
      points={points}
      color={color}
      lineWidth={critical ? 2 : 1}
      transparent
      opacity={critical ? 0.8 : 0.4}
    />
  )
}

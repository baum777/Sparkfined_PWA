/**
 * Star Component
 * Individual feature node in 3D space
 * Sparkfined PWA Trading Platform
 */

import { useRef, useState } from 'react'
import { Sphere, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Feature, statusColors } from '../types'
import { trackInteraction } from '@/services/telemetry/telemetryService'

interface StarProps {
  feature: Feature
  onClick: (feature: Feature) => void
  isSelected: boolean
}

export function Star({ feature, onClick, isSelected }: StarProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  const color = statusColors[feature.status]
  const scale = (feature.priority / 10) * 0.5 + 0.5 // Scale between 0.5 and 1.0

  useFrame((state) => {
    if (!meshRef.current) return
    
    // Gentle pulsing animation for in-progress features
    if (feature.status === 'in_progress') {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1
      meshRef.current.scale.setScalar(scale * pulse)
    }
    
    // Rotate when hovered
    if (hovered) {
      meshRef.current.rotation.y += 0.02
    }
  })

  const handleClick = () => {
    onClick(feature)
    trackInteraction('star_click', 'constellation', { featureId: feature.id })
  }

  const handlePointerEnter = () => {
    setHovered(true)
    document.body.style.cursor = 'pointer'
    trackInteraction('star_hover', 'constellation', { featureId: feature.id })
  }

  const handlePointerLeave = () => {
    setHovered(false)
    document.body.style.cursor = 'default'
  }

  return (
    <group position={feature.position}>
      <Sphere
        ref={meshRef}
        args={[scale, 32, 32]}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.8 : hovered ? 0.5 : 0.2}
          roughness={0.3}
          metalness={0.8}
        />
      </Sphere>

      {/* Label on hover or when selected */}
      {(hovered || isSelected) && (
        <Html distanceFactor={10}>
          <div className="px-3 py-2 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl pointer-events-none whitespace-nowrap">
            <div className="text-sm font-semibold text-white">{feature.name}</div>
            <div className="text-xs text-gray-400 mt-0.5">{feature.status}</div>
          </div>
        </Html>
      )}

      {/* Outer glow ring for selected */}
      {isSelected && (
        <Sphere args={[scale * 1.5, 32, 32]}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </Sphere>
      )}
    </group>
  )
}

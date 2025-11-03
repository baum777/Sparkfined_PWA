/**
 * Star Component
 * Represents a feature as an interactive 3D sphere
 */

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Feature } from '../types'
import { DEFAULT_THEME } from '../types'
import { trackEvent, TelemetryEvents } from '@/services/telemetry'

interface StarProps {
  feature: Feature
  onClick: (feature: Feature) => void
}

export function Star({ feature, onClick }: StarProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Get color based on status
  const color = DEFAULT_THEME.starColors[feature.status]

  // Calculate size based on priority
  const size = 0.3 + (feature.priority / 10) * 0.4 // 0.3 - 0.7

  // Gentle pulse animation for in-progress features
  useFrame((state) => {
    if (meshRef.current && feature.status === 'in-progress') {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      meshRef.current.scale.setScalar(scale)
    }
  })

  const handleClick = () => {
    onClick(feature)
    trackEvent(TelemetryEvents.STAR_CLICK, {
      featureId: feature.id,
      status: feature.status,
    })
  }

  const handlePointerOver = () => {
    setHovered(true)
    document.body.style.cursor = 'pointer'
    trackEvent(TelemetryEvents.STAR_HOVER, {
      featureId: feature.id,
    })
  }

  const handlePointerOut = () => {
    setHovered(false)
    document.body.style.cursor = 'auto'
  }

  return (
    <group position={feature.position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>

      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[size * 1.2, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.3 : 0.1}
        />
      </mesh>

      {/* Label */}
      {hovered && (
        <Html
          position={[0, size + 0.5, 0]}
          center
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
            <div className="text-white font-semibold text-sm whitespace-nowrap">
              {feature.name}
            </div>
            <div className="text-slate-400 text-xs mt-0.5 max-w-xs">
              {feature.description}
            </div>
            <div className="flex gap-1 mt-2">
              <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                feature.status === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : feature.status === 'in-progress'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : feature.status === 'blocked'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-slate-500/20 text-slate-400'
              }`}>
                {feature.status}
              </span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-700 text-slate-300">
                P{feature.priority}
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

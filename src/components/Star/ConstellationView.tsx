// Interactive 3D roadmap visualization using Three.js
import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import * as THREE from 'three'

interface Feature {
  id: string
  name: string
  x: number
  y: number
  z: number
  priority: number
  status: 'completed' | 'in-progress' | 'planned'
  description?: string
}

interface Dependency {
  from: string
  to: string
  critical?: boolean
}

// Roadmap data
const features: Feature[] = [
  { id: 'PWA', name: 'PWA Foundation', x: 0, y: 0, z: 0, priority: 5, status: 'completed' },
  { id: 'CHART', name: 'Chart Module', x: 2, y: 1, z: 0, priority: 5, status: 'completed' },
  { id: 'WATCHLIST', name: 'Watchlist', x: -2, y: 1, z: 0, priority: 4, status: 'completed' },
  { id: 'CONSTELLATION', name: 'Constellation UI', x: 0, y: 3, z: -2, priority: 3, status: 'in-progress' },
  { id: 'ALERTS', name: 'Notifications', x: 3, y: 2, z: 1, priority: 4, status: 'planned' },
  { id: 'ANALYSIS', name: 'AI Analysis', x: -3, y: 2, z: 1, priority: 3, status: 'planned' },
  { id: 'SHARING', name: 'Shared Watchlists', x: 0, y: -2, z: 1, priority: 2, status: 'planned' },
]

const dependencies: Dependency[] = [
  { from: 'PWA', to: 'CHART', critical: true },
  { from: 'PWA', to: 'WATCHLIST', critical: true },
  { from: 'CHART', to: 'CONSTELLATION', critical: false },
  { from: 'WATCHLIST', to: 'ALERTS', critical: false },
  { from: 'CHART', to: 'ANALYSIS', critical: false },
]

function getStatusColor(status: Feature['status']): string {
  switch (status) {
    case 'completed':
      return '#26a69a'
    case 'in-progress':
      return '#ffa726'
    case 'planned':
      return '#42a5f5'
    default:
      return '#757575'
  }
}

function Star({ feature, onClick }: { feature: Feature; onClick?: () => void }) {
  const color = getStatusColor(feature.status)
  const size = feature.priority / 5

  return (
    <group position={[feature.x, feature.y, feature.z]}>
      <mesh onClick={onClick} onPointerOver={(e) => (e.stopPropagation(), (document.body.style.cursor = 'pointer'))} onPointerOut={() => (document.body.style.cursor = 'auto')}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <Text
        position={[0, size + 0.5, 0]}
        fontSize={0.3}
        color="#D9D9D9"
        anchorX="center"
        anchorY="middle"
      >
        {feature.name}
      </Text>
      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[size * 1.2, 16, 16]} />
        <meshStandardMaterial color={color} transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

function DependencyLine({ dependency, features }: { dependency: Dependency; features: Feature[] }) {
  const fromFeature = features.find(f => f.id === dependency.from)
  const toFeature = features.find(f => f.id === dependency.to)

  if (!fromFeature || !toFeature) return null

  const points = [
    new THREE.Vector3(fromFeature.x, fromFeature.y, fromFeature.z),
    new THREE.Vector3(toFeature.x, toFeature.y, toFeature.z),
  ]

  return (
    <Line
      points={points}
      color={dependency.critical ? '#ef5350' : '#42a5f5'}
      lineWidth={dependency.critical ? 2 : 1}
      dashed={!dependency.critical}
    />
  )
}

export function ConstellationView() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)

  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature)
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 to-black relative">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Stars for Features */}
        {features.map(feature => (
          <Star
            key={feature.id}
            feature={feature}
            onClick={() => handleFeatureClick(feature)}
          />
        ))}

        {/* Dependency Lines */}
        {dependencies.map((dep, i) => (
          <DependencyLine
            key={i}
            dependency={dep}
            features={features}
          />
        ))}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
          autoRotate={false}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
        <h3 className="text-lg font-semibold mb-2">Feature Status</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Planned</span>
          </div>
        </div>
      </div>

      {selectedFeature && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white max-w-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold">{selectedFeature.name}</h3>
            <button
              onClick={() => setSelectedFeature(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-300">
            Status: <span className="capitalize">{selectedFeature.status.replace('-', ' ')}</span>
          </p>
          <p className="text-sm text-gray-300 mt-1">
            Priority: {selectedFeature.priority}/5
          </p>
          {selectedFeature.description && (
            <p className="text-sm text-gray-400 mt-2">{selectedFeature.description}</p>
          )}
        </div>
      )}

      <div className="absolute top-4 right-4 text-white text-sm">
        <p className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
          Use mouse to rotate, zoom, and pan
        </p>
      </div>
    </div>
  )
}

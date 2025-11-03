/**
 * ConstellationView Component
 * Main 3D visualization of the feature roadmap
 */

import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Star } from './Star'
import { DependencyLine } from './DependencyLine'
import { features, dependencies } from '../data/features'
import type { Feature, FeatureStatus } from '../types'
import { trackEvent, TelemetryEvents } from '@/services/telemetry'

interface ConstellationViewProps {
  onFeatureClick?: (feature: Feature) => void
}

export function ConstellationView({ onFeatureClick }: ConstellationViewProps) {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [filterStatus, setFilterStatus] = useState<FeatureStatus | 'all'>('all')

  // Filter features based on status
  const filteredFeatures = features.filter(
    (f) => filterStatus === 'all' || f.status === filterStatus
  )

  // Filter dependencies to only show those with visible features
  const filteredDeps = dependencies.filter(
    (d) =>
      filteredFeatures.some((f) => f.id === d.from) &&
      filteredFeatures.some((f) => f.id === d.to)
  )

  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature)
    onFeatureClick?.(feature)
  }

  const handleFilterChange = (status: FeatureStatus | 'all') => {
    setFilterStatus(status)
    trackEvent(TelemetryEvents.FEATURE_FILTER, { status })
  }

  const getFeaturePosition = (id: string): [number, number, number] => {
    const feature = features.find((f) => f.id === id)
    return feature?.position || [0, 0, 0]
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 to-black">
      {/* Canvas */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        onPointerMissed={() => setSelectedFeature(null)}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />

          {/* Background stars */}
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />

          {/* Dependency lines */}
          {filteredDeps.map((dep, i) => (
            <DependencyLine
              key={i}
              start={getFeaturePosition(dep.from)}
              end={getFeaturePosition(dep.to)}
              critical={dep.critical}
            />
          ))}

          {/* Feature stars */}
          {filteredFeatures.map((feature) => (
            <Star
              key={feature.id}
              feature={feature}
              onClick={handleFeatureClick}
            />
          ))}

          {/* Camera controls */}
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={5}
            maxDistance={30}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 space-y-4">
        {/* Title */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-3">
          <h1 className="text-2xl font-bold text-white">Sparkfined Roadmap</h1>
          <p className="text-slate-400 text-sm mt-1">Interactive Feature Constellation</p>
        </div>

        {/* Filter Controls */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg p-3">
          <p className="text-slate-300 text-sm font-medium mb-2">Filter by Status</p>
          <div className="flex flex-wrap gap-2">
            {(['all', 'planned', 'in-progress', 'completed', 'blocked'] as const).map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg p-3">
          <p className="text-slate-300 text-sm font-medium mb-2">Statistics</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Features:</span>
              <span className="text-white font-semibold">{features.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Completed:</span>
              <span className="text-emerald-400 font-semibold">
                {features.filter((f) => f.status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">In Progress:</span>
              <span className="text-yellow-400 font-semibold">
                {features.filter((f) => f.status === 'in-progress').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Planned:</span>
              <span className="text-slate-400 font-semibold">
                {features.filter((f) => f.status === 'planned').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Feature Details */}
      {selectedFeature && (
        <div className="absolute bottom-4 right-4 w-80 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-xl">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold text-white">{selectedFeature.name}</h3>
            <button
              onClick={() => setSelectedFeature(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <p className="text-slate-300 text-sm mb-3">{selectedFeature.description}</p>

          <div className="space-y-2">
            <div className="flex gap-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                selectedFeature.status === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : selectedFeature.status === 'in-progress'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : selectedFeature.status === 'blocked'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-slate-500/20 text-slate-400'
              }`}>
                {selectedFeature.status}
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-300">
                Priority: {selectedFeature.priority}
              </span>
            </div>

            {selectedFeature.tags && selectedFeature.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedFeature.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {selectedFeature.dependencies && selectedFeature.dependencies.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <p className="text-slate-400 text-xs mb-1">Dependencies:</p>
                <div className="space-y-1">
                  {selectedFeature.dependencies.map((depId) => {
                    const dep = features.find((f) => f.id === depId)
                    return (
                      <div key={depId} className="text-xs text-slate-300">
                        • {dep?.name || depId}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg p-3">
        <p className="text-slate-300 text-sm font-medium mb-2">Legend</p>
        <div className="space-y-1.5">
          {[
            { label: 'Completed', color: '#10b981' },
            { label: 'In Progress', color: '#fbbf24' },
            { label: 'Planned', color: '#94a3b8' },
            { label: 'Blocked', color: '#ef4444' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-slate-300">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

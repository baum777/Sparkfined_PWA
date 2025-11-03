/**
 * Constellation View Component
 * Interactive 3D roadmap visualization
 * Sparkfined PWA Trading Platform
 */

import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from './Star'
import { DependencyLine } from './DependencyLine'
import { features, dependencies } from '../data/roadmap'
import { Feature, statusColors } from '../types'

export function ConstellationView() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredFeatures = features.filter(
    feature => filterStatus === 'all' || feature.status === filterStatus
  )

  const getFeaturePosition = (id: string): [number, number, number] => {
    const feature = features.find(f => f.id === id)
    return feature?.position || [0, 0, 0]
  }

  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature)
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      {/* 3D Canvas */}
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 30]} fov={60} />
          
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          
          {/* Background Stars */}
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />

          {/* Feature Stars */}
          {filteredFeatures.map(feature => (
            <Star
              key={feature.id}
              feature={feature}
              onClick={handleFeatureClick}
              isSelected={selectedFeature?.id === feature.id}
            />
          ))}

          {/* Dependency Lines */}
          {dependencies.map((dep, i) => {
            const fromFeature = filteredFeatures.find(f => f.id === dep.from)
            const toFeature = filteredFeatures.find(f => f.id === dep.to)
            
            if (!fromFeature || !toFeature) return null
            
            return (
              <DependencyLine
                key={i}
                start={getFeaturePosition(dep.from)}
                end={getFeaturePosition(dep.to)}
                critical={dep.critical}
                animated={dep.critical}
              />
            )
          })}

          {/* Controls */}
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={10}
            maxDistance={50}
            autoRotate={!selectedFeature}
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 pointer-events-none">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg p-4 pointer-events-auto"
          >
            <h1 className="text-2xl font-bold text-white mb-2">Sparkfined Roadmap</h1>
            <p className="text-gray-400 text-sm">Interactive 3D visualization of features and dependencies</p>
          </motion.div>
        </div>
      </div>

      {/* Legend and Filters */}
      <div className="absolute top-6 right-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg p-4 pointer-events-auto"
        >
          <h3 className="text-sm font-semibold text-white mb-3">Filter by Status</h3>
          <div className="space-y-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`w-full px-3 py-1.5 rounded text-sm transition-all ${
                filterStatus === 'all'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              All Features
            </button>
            {Object.entries(statusColors).map(([status, color]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`w-full px-3 py-1.5 rounded text-sm flex items-center space-x-2 transition-all ${
                  filterStatus === status
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-gray-400 hover:text-white'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize">{status.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Feature Details Panel */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-6 right-6 pointer-events-none"
          >
            <div className="max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-6 shadow-2xl pointer-events-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {selectedFeature.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${statusColors[selectedFeature.status]}20`,
                        color: statusColors[selectedFeature.status]
                      }}
                    >
                      {selectedFeature.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm">
                      Priority: {selectedFeature.priority}/10
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-300 mb-4">{selectedFeature.description}</p>

              <div className="flex flex-wrap gap-2">
                {selectedFeature.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-slate-800 text-gray-400 text-xs rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {selectedFeature.dependencies.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Dependencies</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeature.dependencies.map(depId => {
                      const dep = features.find(f => f.id === depId)
                      return dep ? (
                        <span
                          key={depId}
                          className="px-2 py-1 bg-slate-800 text-gray-300 text-xs rounded"
                        >
                          {dep.name}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Hint */}
      <div className="absolute bottom-6 right-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-lg px-4 py-2"
        >
          <p className="text-gray-400 text-xs">
            🖱️ Click &amp; drag to rotate • Scroll to zoom • Click stars for details
          </p>
        </motion.div>
      </div>
    </div>
  )
}

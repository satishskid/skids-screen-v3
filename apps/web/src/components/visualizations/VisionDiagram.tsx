/**
 * Vision Diagram — Eye diagram with red reflex and refraction data.
 * SVG-based visualization of photoscreening results.
 */

import type { Observation } from '@skids/shared'
import { useMemo } from 'react'

interface VisionDiagramProps {
  observations: Observation[]
}

export function VisionDiagram({ observations }: VisionDiagramProps) {
  const data = useMemo(() => {
    const visionObs = observations.find(o => o.moduleType === 'vision')
    if (!visionObs) return null

    const features = visionObs.aiAnnotations?.[0]?.features as Record<string, unknown> | undefined
    const ann = visionObs.annotationData as {
      selectedChips?: string[]
      chipSeverities?: Record<string, string>
    } | undefined

    return {
      leftIntensity: (features?.leftRedReflexIntensity as number) ?? 0.5,
      rightIntensity: (features?.rightRedReflexIntensity as number) ?? 0.5,
      symmetry: (features?.redReflexSymmetry as number) ?? 1,
      chips: ann?.selectedChips ?? [],
      severities: ann?.chipSeverities ?? {},
    }
  }, [observations])

  if (!data) {
    return <p className="text-xs text-gray-400 text-center py-8">No vision data available</p>
  }

  const leftColor = data.leftIntensity > 0.5 ? '#ef4444' : '#fca5a5'
  const rightColor = data.rightIntensity > 0.5 ? '#ef4444' : '#fca5a5'
  const asymmetric = Math.abs(data.leftIntensity - data.rightIntensity) > 0.2

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 240 100" className="w-full max-w-sm mx-auto">
        <rect x="0" y="0" width="240" height="100" fill="#fafafa" rx="8" />

        {/* Labels */}
        <text x="70" y="15" textAnchor="middle" fontSize="9" fill="#6b7280">Left Eye (OS)</text>
        <text x="170" y="15" textAnchor="middle" fontSize="9" fill="#6b7280">Right Eye (OD)</text>

        {/* Left eye */}
        <ellipse cx="70" cy="50" rx="30" ry="22" fill="white" stroke="#d1d5db" strokeWidth="1.5" />
        <circle cx="70" cy="50" r="10" fill="#1f2937" />
        <circle cx="70" cy="50" r="6" fill={leftColor} opacity="0.8" />

        {/* Right eye */}
        <ellipse cx="170" cy="50" rx="30" ry="22" fill="white" stroke="#d1d5db" strokeWidth="1.5" />
        <circle cx="170" cy="50" r="10" fill="#1f2937" />
        <circle cx="170" cy="50" r="6" fill={rightColor} opacity="0.8" />

        {/* Symmetry indicator */}
        <line x1="110" y1="40" x2="130" y2="40" stroke={asymmetric ? '#f97316' : '#22c55e'} strokeWidth="2" />
        <text x="120" y="38" textAnchor="middle" fontSize="7" fill={asymmetric ? '#f97316' : '#22c55e'}>
          {asymmetric ? 'Asymmetric' : 'Symmetric'}
        </text>

        {/* Intensity labels */}
        <text x="70" y="82" textAnchor="middle" fontSize="8" fill="#6b7280">
          {Math.round(data.leftIntensity * 100)}%
        </text>
        <text x="170" y="82" textAnchor="middle" fontSize="8" fill="#6b7280">
          {Math.round(data.rightIntensity * 100)}%
        </text>
      </svg>

      {/* Findings */}
      {data.chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {data.chips.map(chipId => (
            <span key={chipId} className="text-[10px] px-1.5 py-0.5 rounded border border-purple-200 text-purple-700 bg-purple-50">
              {chipId}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

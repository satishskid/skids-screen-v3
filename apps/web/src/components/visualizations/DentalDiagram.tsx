/**
 * Dental Diagram — SVG tooth map with color-coded severity findings.
 * Shows upper/lower arches with findings mapped to quadrants.
 */

import type { Observation } from '@skids/shared'
import { useMemo } from 'react'

interface DentalDiagramProps {
  observations: Observation[]
}

const SEVERITY_COLORS: Record<string, string> = {
  normal: '#22c55e',
  mild: '#eab308',
  moderate: '#f97316',
  severe: '#ef4444',
}

// Simplified tooth positions (16 per arch, numbered 1-16)
const UPPER_TEETH = Array.from({ length: 16 }, (_, i) => ({
  id: `upper_${i + 1}`,
  x: 30 + i * 16,
  y: 30,
}))

const LOWER_TEETH = Array.from({ length: 16 }, (_, i) => ({
  id: `lower_${i + 1}`,
  x: 30 + i * 16,
  y: 80,
}))

export function DentalDiagram({ observations }: DentalDiagramProps) {
  const { chips, severities, pins } = useMemo(() => {
    const dentalObs = observations.find(o => o.moduleType === 'dental')
    if (!dentalObs) return { chips: [], severities: {} as Record<string, string>, pins: [] as Array<{ x: number; y: number; label?: string; severity?: string }> }

    const ann = dentalObs.annotationData as {
      selectedChips?: string[]
      chipSeverities?: Record<string, string>
      pins?: Array<{ x: number; y: number; label?: string; severity?: string }>
    } | undefined

    return {
      chips: ann?.selectedChips ?? [],
      severities: ann?.chipSeverities ?? {},
      pins: ann?.pins ?? [],
    }
  }, [observations])

  const hasFindings = chips.length > 0 || pins.length > 0

  return (
    <div className="space-y-2">
      <svg viewBox="0 0 290 120" className="w-full max-w-md mx-auto">
        {/* Background */}
        <rect x="0" y="0" width="290" height="120" fill="#fafafa" rx="8" />

        {/* Labels */}
        <text x="145" y="18" textAnchor="middle" fontSize="8" fill="#9ca3af">Upper Arch</text>
        <text x="145" y="72" textAnchor="middle" fontSize="8" fill="#9ca3af">Lower Arch</text>

        {/* Upper teeth */}
        {UPPER_TEETH.map(tooth => (
          <rect key={tooth.id} x={tooth.x} y={tooth.y} width="12" height="16"
            rx="2" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="0.5" />
        ))}

        {/* Lower teeth */}
        {LOWER_TEETH.map(tooth => (
          <rect key={tooth.id} x={tooth.x} y={tooth.y} width="12" height="16"
            rx="2" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="0.5" />
        ))}

        {/* Pin markers */}
        {pins.map((pin, i) => {
          const color = pin.severity ? SEVERITY_COLORS[pin.severity] || '#6366f1' : '#6366f1'
          // Scale pin percentages to SVG coordinates
          const x = (pin.x / 100) * 290
          const y = (pin.y / 100) * 120
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill={color} opacity="0.8" />
              <circle cx={x} cy={y} r="2" fill="white" />
              {pin.label && (
                <text x={x} y={y - 7} textAnchor="middle" fontSize="6" fill={color}>
                  {pin.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      {hasFindings && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map(chipId => {
            const sev = severities[chipId] || 'normal'
            return (
              <span
                key={chipId}
                className="text-[10px] px-1.5 py-0.5 rounded border"
                style={{
                  borderColor: SEVERITY_COLORS[sev] || '#d1d5db',
                  color: SEVERITY_COLORS[sev] || '#6b7280',
                  backgroundColor: `${SEVERITY_COLORS[sev] || '#f3f4f6'}20`,
                }}
              >
                {chipId} ({sev})
              </span>
            )
          })}
        </div>
      )}

      {!hasFindings && (
        <p className="text-xs text-gray-400 text-center">No dental findings recorded</p>
      )}
    </div>
  )
}

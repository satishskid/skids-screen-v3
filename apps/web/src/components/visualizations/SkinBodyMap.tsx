/**
 * Skin Body Map — SVG body outline with lesion/finding markers.
 * Pins are plotted as colored circles on a human silhouette.
 */

import type { Observation } from '@skids/shared'
import { useMemo } from 'react'

interface SkinBodyMapProps {
  observations: Observation[]
}

const SEVERITY_COLORS: Record<string, string> = {
  normal: '#22c55e',
  mild: '#eab308',
  moderate: '#f97316',
  severe: '#ef4444',
}

export function SkinBodyMap({ observations }: SkinBodyMapProps) {
  const { chips, severities, pins } = useMemo(() => {
    const skinObs = observations.find(o => o.moduleType === 'skin')
    if (!skinObs) return { chips: [] as string[], severities: {} as Record<string, string>, pins: [] as Array<{ x: number; y: number; label?: string; severity?: string }> }

    const ann = skinObs.annotationData as {
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

  return (
    <div className="space-y-2">
      <svg viewBox="0 0 200 320" className="w-full max-w-[200px] mx-auto">
        {/* Background */}
        <rect x="0" y="0" width="200" height="320" fill="#fafafa" rx="8" />

        {/* Simplified body outline */}
        {/* Head */}
        <ellipse cx="100" cy="35" rx="22" ry="26" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
        {/* Neck */}
        <rect x="92" y="60" width="16" height="12" fill="none" stroke="#d1d5db" strokeWidth="1" />
        {/* Torso */}
        <rect x="65" y="72" width="70" height="90" rx="8" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
        {/* Left arm */}
        <rect x="30" y="75" width="35" height="14" rx="4" fill="none" stroke="#d1d5db" strokeWidth="1" />
        <rect x="15" y="89" width="15" height="50" rx="4" fill="none" stroke="#d1d5db" strokeWidth="1" />
        {/* Right arm */}
        <rect x="135" y="75" width="35" height="14" rx="4" fill="none" stroke="#d1d5db" strokeWidth="1" />
        <rect x="170" y="89" width="15" height="50" rx="4" fill="none" stroke="#d1d5db" strokeWidth="1" />
        {/* Left leg */}
        <rect x="68" y="162" width="28" height="80" rx="6" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
        <rect x="70" y="242" width="24" height="60" rx="4" fill="none" stroke="#d1d5db" strokeWidth="1" />
        {/* Right leg */}
        <rect x="104" y="162" width="28" height="80" rx="6" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
        <rect x="106" y="242" width="24" height="60" rx="4" fill="none" stroke="#d1d5db" strokeWidth="1" />

        {/* Pin markers */}
        {pins.map((pin, i) => {
          const color = pin.severity ? SEVERITY_COLORS[pin.severity] || '#6366f1' : '#6366f1'
          const x = (pin.x / 100) * 200
          const y = (pin.y / 100) * 320
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="8" fill={color} opacity="0.7" />
              <circle cx={x} cy={y} r="3" fill="white" />
              {pin.label && (
                <text x={x} y={y - 10} textAnchor="middle" fontSize="7" fill={color} fontWeight="bold">
                  {pin.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Chips legend */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {chips.map(chipId => {
            const sev = severities[chipId] || 'normal'
            return (
              <span
                key={chipId}
                className="text-[10px] px-1.5 py-0.5 rounded border"
                style={{
                  borderColor: SEVERITY_COLORS[sev] || '#d1d5db',
                  color: SEVERITY_COLORS[sev] || '#6b7280',
                }}
              >
                {chipId}
              </span>
            )
          })}
        </div>
      )}

      {chips.length === 0 && pins.length === 0 && (
        <p className="text-xs text-gray-400 text-center">No skin findings recorded</p>
      )}
    </div>
  )
}

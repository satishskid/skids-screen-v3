/**
 * Report Inline Charts — Compact visualizations for child health reports.
 * Includes: Z-score gauges, inline audiogram, behavioral radar, evidence gallery.
 */

import { useMemo } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import type { Observation } from '@skids/shared'

// ─── Z-Score Gauge ──────────────────────────────────────────────

interface ZScoreGaugeProps {
  label: string
  zScore: number
  value?: number
  unit?: string
}

export function ZScoreGauge({ label, zScore, value, unit }: ZScoreGaugeProps) {
  // Map Z-score to 0-100 position
  const position = Math.max(0, Math.min(100, ((zScore + 3) / 6) * 100))
  const color =
    zScore < -2 ? '#ef4444' :
    zScore < -1 ? '#f97316' :
    zScore <= 1 ? '#22c55e' :
    zScore <= 2 ? '#f97316' :
    '#ef4444'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-gray-700">{label}</span>
        {value !== undefined && (
          <span className="text-[10px] text-gray-500">{value} {unit}</span>
        )}
      </div>

      <div className="relative h-3 bg-gradient-to-r from-red-200 via-green-200 to-red-200 rounded-full">
        <div
          className="absolute top-[-2px] w-3.5 h-3.5 rounded-full border-2 border-white shadow"
          style={{
            left: `calc(${position}% - 7px)`,
            backgroundColor: color,
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[8px] text-gray-400">-3 SD</span>
        <span className="text-[10px] font-medium" style={{ color }}>
          Z = {zScore.toFixed(1)}
        </span>
        <span className="text-[8px] text-gray-400">+3 SD</span>
      </div>
    </div>
  )
}

// ─── Inline Growth Panel ─────────────────────────────────────────

interface InlineGrowthPanelProps {
  observations: Observation[]
}

export function InlineGrowthPanel({ observations }: InlineGrowthPanelProps) {
  const metrics = useMemo(() => {
    const result: Array<{ label: string; zScore: number; value?: number; unit?: string }> = []

    const heightObs = observations.find(o => o.moduleType === 'height')
    const weightObs = observations.find(o => o.moduleType === 'weight')

    if (heightObs) {
      const f = heightObs.aiAnnotations?.[0]?.features as Record<string, number> | undefined
      if (f?.heightForAgeZ !== undefined) {
        result.push({ label: 'Height-for-Age', zScore: f.heightForAgeZ, value: f.value, unit: 'cm' })
      }
    }
    if (weightObs) {
      const f = weightObs.aiAnnotations?.[0]?.features as Record<string, number> | undefined
      if (f?.weightForAgeZ !== undefined) {
        result.push({ label: 'Weight-for-Age', zScore: f.weightForAgeZ, value: f.value, unit: 'kg' })
      }
      if (f?.bmiForAgeZ !== undefined) {
        result.push({ label: 'BMI-for-Age', zScore: f.bmiForAgeZ, value: f.bmiValue, unit: '' })
      }
    }

    return result
  }, [observations])

  if (metrics.length === 0) return null

  return (
    <div className="space-y-3">
      {metrics.map(m => (
        <ZScoreGauge key={m.label} {...m} />
      ))}
    </div>
  )
}

// ─── Behavioral Radar ────────────────────────────────────────────

interface BehavioralRadarProps {
  observations: Observation[]
}

export function BehavioralRadar({ observations }: BehavioralRadarProps) {
  const data = useMemo(() => {
    const neuroObs = observations.find(o => o.moduleType === 'neurodevelopment')
    if (!neuroObs) return []

    const features = neuroObs.aiAnnotations?.[0]?.features as Record<string, number> | undefined
    if (!features) return []

    return [
      { dimension: 'Social', score: features.socialScore ?? 0, fullMark: 5 },
      { dimension: 'Communication', score: features.communicationScore ?? 0, fullMark: 5 },
      { dimension: 'Motor', score: features.motorScore ?? 0, fullMark: 5 },
      { dimension: 'Cognitive', score: features.cognitiveScore ?? 0, fullMark: 5 },
      { dimension: 'Adaptive', score: features.adaptiveScore ?? 0, fullMark: 5 },
    ]
  }, [observations])

  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9 }} />
        <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// ─── Evidence Gallery ────────────────────────────────────────────

interface EvidenceGalleryProps {
  observations: Observation[]
}

export function EvidenceGallery({ observations }: EvidenceGalleryProps) {
  const images = useMemo(() => {
    return observations
      .filter(o => o.mediaUrl && o.mediaType?.startsWith('image'))
      .map(o => ({
        moduleType: o.moduleType,
        url: o.mediaUrl!,
        riskCategory: o.aiAnnotations?.[0]?.riskCategory || 'no_risk',
      }))
  }, [observations])

  if (images.length === 0) return null

  return (
    <div className="grid grid-cols-3 gap-2">
      {images.map((img, i) => (
        <div key={i} className="relative rounded-lg overflow-hidden border border-gray-200">
          <img
            src={img.url}
            alt={img.moduleType}
            className="w-full h-20 object-cover"
            loading="lazy"
          />
          <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 text-center">
            {img.moduleType}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Inline Audiogram ────────────────────────────────────────────

interface InlineAudiogramProps {
  observations: Observation[]
}

export function InlineAudiogram({ observations }: InlineAudiogramProps) {
  const data = useMemo(() => {
    const hearingObs = observations.find(o => o.moduleType === 'hearing')
    if (!hearingObs) return null

    const features = hearingObs.aiAnnotations?.[0]?.features as Record<string, unknown> | undefined
    const thresholds = features?.hearingThresholds as { left: Record<number, number>; right: Record<number, number> } | undefined
    if (!thresholds) return null

    return { left: thresholds.left, right: thresholds.right }
  }, [observations])

  if (!data) return null

  const FREQS = [500, 1000, 2000, 4000]

  return (
    <svg viewBox="0 0 200 80" className="w-full max-w-xs">
      <rect x="0" y="0" width="200" height="80" fill="#fafafa" rx="4" />
      {/* Grid lines */}
      {[0, 20, 40, 60].map(db => (
        <line key={db} x1="25" y1={10 + db} x2="190" y2={10 + db} stroke="#e5e7eb" strokeWidth="0.5" />
      ))}

      {/* Left ear */}
      {FREQS.map((freq, i) => {
        const x = 35 + i * 45
        const db = data.left?.[freq]
        if (db === undefined) return null
        const y = 10 + Math.min(60, db)
        return <circle key={`l${freq}`} cx={x - 4} cy={y} r="3" fill="#3b82f6" />
      })}

      {/* Right ear */}
      {FREQS.map((freq, i) => {
        const x = 35 + i * 45
        const db = data.right?.[freq]
        if (db === undefined) return null
        const y = 10 + Math.min(60, db)
        return <circle key={`r${freq}`} cx={x + 4} cy={y} r="3" fill="#ef4444" />
      })}

      {/* Frequency labels */}
      {FREQS.map((freq, i) => (
        <text key={freq} x={35 + i * 45} y={78} textAnchor="middle" fontSize="7" fill="#9ca3af">
          {freq >= 1000 ? `${freq / 1000}k` : freq}
        </text>
      ))}
    </svg>
  )
}

// ─── Inline Cardiac Summary ──────────────────────────────────────

interface InlineCardiacSummaryProps {
  observations: Observation[]
}

export function InlineCardiacSummary({ observations }: InlineCardiacSummaryProps) {
  const findings = useMemo(() => {
    const cardiacObs = observations.find(o => o.moduleType === 'cardiac')
    if (!cardiacObs) return null

    const ann = cardiacObs.annotationData as { selectedChips?: string[] } | undefined
    const features = cardiacObs.aiAnnotations?.[0]?.features as Record<string, Record<string, number>> | undefined

    return {
      chips: ann?.selectedChips ?? [],
      heartRate: features?.heartRate as unknown as number,
    }
  }, [observations])

  if (!findings) return null

  return (
    <div className="flex items-center gap-2 text-xs">
      {findings.heartRate && (
        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
          HR: {Math.round(findings.heartRate)} BPM
        </span>
      )}
      {findings.chips.length === 0 && (
        <span className="text-green-600">Normal S1/S2</span>
      )}
      {findings.chips.length > 0 && (
        <span className="text-amber-600">{findings.chips.length} finding(s)</span>
      )}
    </div>
  )
}

/**
 * Audiogram Chart — Hearing threshold visualization with severity bands.
 * Uses Recharts LineChart with reversed Y-axis (audiometric convention).
 */

import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceArea,
} from 'recharts'
import type { Observation } from '@skids/shared'

interface AudiogramChartProps {
  observations: Observation[]
}

const FREQUENCIES = [500, 1000, 2000, 4000]

const SEVERITY_BANDS = [
  { y1: -10, y2: 15, fill: '#dcfce7', label: 'Normal' },
  { y1: 15, y2: 25, fill: '#fef9c3', label: 'Slight' },
  { y1: 25, y2: 40, fill: '#fef3c7', label: 'Mild' },
  { y1: 40, y2: 55, fill: '#fed7aa', label: 'Moderate' },
  { y1: 55, y2: 70, fill: '#fecaca', label: 'Mod. Severe' },
  { y1: 70, y2: 90, fill: '#fca5a5', label: 'Severe' },
  { y1: 90, y2: 120, fill: '#e9d5ff', label: 'Profound' },
]

export function AudiogramChart({ observations }: AudiogramChartProps) {
  const chartData = useMemo(() => {
    const hearingObs = observations.find(o => o.moduleType === 'hearing')
    if (!hearingObs) return []

    const features = hearingObs.aiAnnotations?.[0]?.features as Record<string, unknown> | undefined
    const thresholds = features?.hearingThresholds as { left: Record<number, number>; right: Record<number, number> } | undefined
    if (!thresholds) return []

    return FREQUENCIES.map(freq => ({
      frequency: freq,
      leftDb: thresholds.left?.[freq] ?? null,
      rightDb: thresholds.right?.[freq] ?? null,
    }))
  }, [observations])

  if (chartData.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-8">No hearing data available</p>
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-blue-500 inline-block" /> Left Ear
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-red-500 inline-block" /> Right Ear
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          {SEVERITY_BANDS.map((band, i) => (
            <ReferenceArea key={i} y1={band.y1} y2={band.y2} fill={band.fill} fillOpacity={0.5} />
          ))}
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="frequency"
            tick={{ fontSize: 10 }}
            label={{ value: 'Frequency (Hz)', position: 'bottom', fontSize: 10 }}
          />
          <YAxis
            reversed
            domain={[-10, 120]}
            tick={{ fontSize: 10 }}
            label={{ value: 'Hearing Level (dB)', angle: -90, position: 'insideLeft', fontSize: 10 }}
          />
          <Tooltip contentStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="leftDb"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#3b82f6' }}
            connectNulls
            name="Left (dB)"
          />
          <Line
            type="monotone"
            dataKey="rightDb"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4, fill: '#ef4444' }}
            connectNulls
            name="Right (dB)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

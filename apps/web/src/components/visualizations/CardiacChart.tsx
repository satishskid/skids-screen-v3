/**
 * Cardiac Chart — 4-point auscultation frequency energy visualization.
 * Uses Recharts BarChart with stacked frequency bands.
 */

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { Observation } from '@skids/shared'
import { CARDIAC_POINTS } from '@skids/shared'

interface CardiacChartProps {
  observations: Observation[]
}

export function CardiacChart({ observations }: CardiacChartProps) {
  const chartData = useMemo(() => {
    const cardiacObs = observations.find(o => o.moduleType === 'cardiac')
    if (!cardiacObs) return []

    const features = cardiacObs.aiAnnotations?.[0]?.features as Record<string, unknown> | undefined
    if (!features) return []

    return CARDIAC_POINTS.map(point => {
      const pointData = features[point.id] as Record<string, number> | undefined
      return {
        point: point.name,
        low: pointData?.lowFreqEnergy ?? 0,
        mid: pointData?.midFreqEnergy ?? 0,
        high: pointData?.highFreqEnergy ?? 0,
        classification: pointData?.midToLowRatio && pointData.midToLowRatio > 0.5 ? 'Possible Murmur' : 'Normal',
      }
    })
  }, [observations])

  if (chartData.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-8">No cardiac data available</p>
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" /> Low (S1/S2)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Mid (Murmur)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gray-300 inline-block" /> High (Noise)</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="point" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} label={{ value: 'Energy', angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 11 }} />
          <Bar dataKey="low" stackId="freq" fill="#60a5fa" name="Low Freq" />
          <Bar dataKey="mid" stackId="freq" fill="#fbbf24" name="Mid Freq" />
          <Bar dataKey="high" stackId="freq" fill="#d1d5db" name="High Freq" />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-2">
        {chartData.map(d => (
          <span
            key={d.point}
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              d.classification === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {d.point}: {d.classification}
          </span>
        ))}
      </div>
    </div>
  )
}

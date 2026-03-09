/**
 * Pulmonary Chart — 6-point lung assessment frequency energy visualization.
 * Uses Recharts BarChart with stacked breath/wheeze/rhonchi bands.
 */

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import type { Observation } from '@skids/shared'
import { PULMONARY_POINTS } from '@skids/shared'

interface PulmonaryChartProps {
  observations: Observation[]
}

export function PulmonaryChart({ observations }: PulmonaryChartProps) {
  const chartData = useMemo(() => {
    const pulObs = observations.find(o => o.moduleType === 'pulmonary')
    if (!pulObs) return []

    const features = pulObs.aiAnnotations?.[0]?.features as Record<string, unknown> | undefined
    if (!features) return []

    return PULMONARY_POINTS.map(point => {
      const pointData = features[point.id] as Record<string, number> | undefined
      return {
        point: point.name.replace(' (Post)', 'P').replace(' (Ant)', 'A'),
        breath: pointData?.breathEnergy ?? 0,
        wheeze: pointData?.wheezeEnergy ?? 0,
        rhonchi: pointData?.rhonchiEnergy ?? 0,
      }
    })
  }, [observations])

  if (chartData.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-8">No pulmonary data available</p>
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-sky-400 inline-block" /> Breath</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Wheeze</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Rhonchi</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="point" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 11 }} />
          <Bar dataKey="breath" stackId="freq" fill="#38bdf8" name="Breath" />
          <Bar dataKey="wheeze" stackId="freq" fill="#fbbf24" name="Wheeze" />
          <Bar dataKey="rhonchi" stackId="freq" fill="#f87171" name="Rhonchi" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

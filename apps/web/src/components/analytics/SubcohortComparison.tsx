/**
 * Subcohort Comparison — Side-by-side comparison of cohorts by gender/age/class/location.
 * Uses compareSubCohorts from @skids/shared.
 */

import { useState, useMemo } from 'react'
import type { CampaignDataBundle } from '@skids/shared'
import { compareSubCohorts } from '@skids/shared'

interface SubcohortComparisonProps {
  bundles: CampaignDataBundle[]
}

type GroupBy = 'gender' | 'age_group' | 'class' | 'location'

const GROUP_OPTIONS: Array<{ value: GroupBy; label: string }> = [
  { value: 'gender', label: 'Gender' },
  { value: 'age_group', label: 'Age Group' },
  { value: 'class', label: 'Class' },
  { value: 'location', label: 'Location' },
]

export function SubcohortComparison({ bundles }: SubcohortComparisonProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>('gender')

  const comparison = useMemo(() => compareSubCohorts(bundles, groupBy), [bundles, groupBy])

  if (!comparison || comparison.cohorts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Subcohort Comparison</h3>
        <p className="mt-3 text-sm text-gray-400 text-center py-8">No data available for comparison.</p>
      </div>
    )
  }

  const maxChildren = Math.max(...comparison.cohorts.map(c => c.totalChildren), 1)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Subcohort Comparison</h3>
        <div className="flex gap-1">
          {GROUP_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setGroupBy(opt.value)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                groupBy === opt.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {comparison.cohorts.map(cohort => {
          const totalRisk = cohort.riskBreakdown.noRisk + cohort.riskBreakdown.possibleRisk + cohort.riskBreakdown.highRisk
          const hrPct = totalRisk > 0 ? Math.round((cohort.riskBreakdown.highRisk / totalRisk) * 100) : 0
          const barWidth = Math.round((cohort.totalChildren / maxChildren) * 100)

          return (
            <div key={cohort.label} className="rounded-lg border border-gray-100 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">{cohort.label}</span>
                <span className="text-xs text-gray-500">{cohort.totalChildren} children</span>
              </div>

              {/* Population bar */}
              <div className="h-2 rounded-full bg-gray-100 mb-2">
                <div className="h-2 rounded-full bg-blue-400" style={{ width: `${barWidth}%` }} />
              </div>

              {/* Risk + coverage */}
              <div className="flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-gray-500">Normal: {cohort.riskBreakdown.noRisk}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-gray-500">Possible: {cohort.riskBreakdown.possibleRisk}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-gray-500">High: {cohort.riskBreakdown.highRisk}</span>
                </div>
                <span className={`ml-auto px-1.5 py-0.5 rounded ${
                  hrPct > 20 ? 'bg-red-100 text-red-700' :
                  hrPct > 10 ? 'bg-amber-100 text-amber-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {hrPct}% high risk
                </span>
              </div>

              {/* Top conditions for this cohort */}
              {cohort.topConditions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {cohort.topConditions.slice(0, 4).map(cond => (
                    <span key={cond.conditionId} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                      {cond.conditionName}: {cond.count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

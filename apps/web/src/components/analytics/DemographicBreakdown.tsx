/**
 * Demographic Breakdown — Gender/age cross-tabs with condition correlations.
 * Uses computeDemographicBreakdown from @skids/shared.
 */

import { useMemo } from 'react'
import type { CampaignDataBundle } from '@skids/shared'
import { computeDemographicBreakdown } from '@skids/shared'

interface DemographicBreakdownProps {
  bundles: CampaignDataBundle[]
}

export function DemographicBreakdown({ bundles }: DemographicBreakdownProps) {
  const demo = useMemo(() => computeDemographicBreakdown(bundles), [bundles])

  const totalGender = demo.genderSplit.reduce((s, g) => s + g.count, 0)
  const totalAge = demo.ageGroups.reduce((s, g) => s + g.count, 0)

  return (
    <div className="space-y-6">
      {/* Gender Distribution */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Gender Distribution</h3>
        <div className="mt-4 flex gap-4">
          {demo.genderSplit.map(g => {
            const pct = totalGender > 0 ? Math.round((g.count / totalGender) * 100) : 0
            return (
              <div key={g.gender} className="flex-1 rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{g.count}</p>
                <p className="text-xs text-gray-500 capitalize">{g.gender}</p>
                <p className="text-[10px] text-gray-400">{pct}%</p>
                {g.riskBreakdown && (
                  <div className="mt-2 flex justify-center gap-1">
                    <span className="text-[9px] px-1 py-0.5 rounded bg-green-100 text-green-700">
                      {g.riskBreakdown.noRisk} ok
                    </span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-red-100 text-red-700">
                      {g.riskBreakdown.highRisk} risk
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Age Group Distribution */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Age Group Distribution</h3>
        <div className="mt-4 space-y-2">
          {demo.ageGroups.map(ag => {
            const barPct = totalAge > 0 ? Math.round((ag.count / totalAge) * 100) : 0
            return (
              <div key={ag.group} className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-700">{ag.group}</span>
                <div className="flex-1">
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-3 rounded-full bg-blue-500 transition-all" style={{ width: `${barPct}%` }} />
                  </div>
                </div>
                <span className="w-20 text-right text-xs text-gray-500">{ag.count} ({ag.percentage}%)</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Condition by Gender Cross-Tab */}
      {demo.conditionByGender.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Conditions by Gender</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 text-left text-xs font-medium text-gray-500">Condition</th>
                  <th className="py-2 text-right text-xs font-medium text-gray-500">Male</th>
                  <th className="py-2 text-right text-xs font-medium text-gray-500">Female</th>
                  <th className="py-2 text-right text-xs font-medium text-gray-500">Ratio</th>
                </tr>
              </thead>
              <tbody>
                {demo.conditionByGender.slice(0, 15).map(row => {
                  const total = row.male + row.female
                  const ratio = row.female > 0 ? (row.male / row.female).toFixed(1) : '—'
                  return (
                    <tr key={row.conditionName} className="border-b border-gray-100">
                      <td className="py-2 text-gray-800">{row.conditionName}</td>
                      <td className="py-2 text-right text-gray-600">{row.male}</td>
                      <td className="py-2 text-right text-gray-600">{row.female}</td>
                      <td className="py-2 text-right text-xs text-gray-400">{ratio}:1</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Condition by Age Cross-Tab */}
      {demo.conditionByAge.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Conditions by Age Group</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 text-left text-xs font-medium text-gray-500">Condition</th>
                  {demo.ageGroups.map(ag => (
                    <th key={ag.group} className="py-2 text-right text-xs font-medium text-gray-500">{ag.group}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demo.conditionByAge.slice(0, 15).map(row => (
                  <tr key={row.conditionName} className="border-b border-gray-100">
                    <td className="py-2 text-gray-800">{row.conditionName}</td>
                    {demo.ageGroups.map(ag => (
                      <td key={ag.group} className="py-2 text-right text-gray-600">
                        {row.byAge[ag.group] ?? 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

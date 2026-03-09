/**
 * Cohort Analytics Panel — Risk distribution, module completion, 4D category breakdown.
 * Uses computeCohortAnalytics from @skids/shared.
 */

import { useMemo } from 'react'
import type { Child, Observation, ModuleType } from '@skids/shared'
import { computeCohortAnalytics, getModuleName, FOUR_D_CATEGORY_LABELS, FOUR_D_CATEGORY_COLORS } from '@skids/shared'
import type { FourDCategory } from '@skids/shared'

interface CohortAnalyticsPanelProps {
  children: Child[]
  observations: Observation[]
  enabledModules: ModuleType[]
}

export function CohortAnalyticsPanel({ children, observations, enabledModules }: CohortAnalyticsPanelProps) {
  const analytics = useMemo(
    () => computeCohortAnalytics(children, observations, enabledModules),
    [children, observations, enabledModules],
  )

  return (
    <div className="space-y-6">
      {/* Risk Breakdown */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Risk Distribution</h3>
        <p className="mt-1 text-xs text-gray-500">
          {analytics.totalObservations} observations across {analytics.totalScreened} children.
        </p>
        <div className="mt-4 space-y-2">
          <RiskRow label="No Risk" count={analytics.riskBreakdown.noRisk} total={analytics.totalObservations} color="bg-green-500" />
          <RiskRow label="Possible Risk" count={analytics.riskBreakdown.possibleRisk} total={analytics.totalObservations} color="bg-amber-500" />
          <RiskRow label="High Risk" count={analytics.riskBreakdown.highRisk} total={analytics.totalObservations} color="bg-red-500" />
        </div>
      </div>

      {/* Module Completion */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Module Completion</h3>
        <div className="mt-4 space-y-2">
          {analytics.moduleCompletion.map(mod => (
            <div key={mod.moduleType} className="flex items-center gap-3">
              <span className="w-32 truncate text-sm text-gray-700">{mod.moduleName}</span>
              <div className="flex-1">
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-2.5 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${mod.percentage}%` }}
                  />
                </div>
              </div>
              <span className="w-20 text-right text-xs text-gray-500">
                {mod.count}/{mod.total} ({mod.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4D Category Breakdown */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">4D Category Screening</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {analytics.categoryBreakdown.map(cat => {
            const catKey = cat.category as FourDCategory
            const colors = FOUR_D_CATEGORY_COLORS[catKey]
            const totalAssessed = cat.present + cat.absent
            const presencePct = totalAssessed > 0 ? Math.round((cat.present / totalAssessed) * 100) : 0
            return (
              <div key={cat.category} className={`rounded-lg border p-3 ${colors?.bg || 'bg-gray-50'} ${colors?.border || 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${colors?.text || 'text-gray-800'}`}>{cat.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${colors?.badge || 'bg-gray-100 text-gray-700'}`}>
                    {cat.present} found
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/50">
                    <div
                      className={`h-1.5 rounded-full transition-all ${presencePct > 0 ? 'bg-current opacity-60' : ''}`}
                      style={{ width: `${presencePct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-600">{presencePct}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Conditions */}
      {analytics.topConditions.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Top Conditions</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 text-left text-xs font-medium text-gray-500">Condition</th>
                  <th className="py-2 text-left text-xs font-medium text-gray-500">Category</th>
                  <th className="py-2 text-right text-xs font-medium text-gray-500">Count</th>
                  <th className="py-2 text-right text-xs font-medium text-gray-500">Prevalence</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topConditions.slice(0, 10).map(cond => {
                  const catLabel = FOUR_D_CATEGORY_LABELS[cond.category as FourDCategory] || cond.category
                  return (
                    <tr key={cond.conditionId} className="border-b border-gray-100">
                      <td className="py-2 text-gray-800">{cond.conditionName}</td>
                      <td className="py-2 text-xs text-gray-500">{catLabel}</td>
                      <td className="py-2 text-right text-gray-600">{cond.count}</td>
                      <td className="py-2 text-right">
                        <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                          {cond.prevalence.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function RiskRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-gray-600">{label}</span>
      <div className="flex-1">
        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
          <div className={`h-3 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="w-20 text-right text-xs font-medium text-gray-500">{count} ({pct}%)</span>
    </div>
  )
}

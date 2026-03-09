/**
 * Prevalence Report — Condition prevalence table with ICD codes and severity breakdown.
 * Uses computePrevalenceReport from @skids/shared.
 */

import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import type { Child, Observation } from '@skids/shared'
import { computePrevalenceReport, exportConditionsToCSV, generateReportFilename } from '@skids/shared'

interface PrevalenceReportProps {
  children: Child[]
  observations: Observation[]
  campaignCode: string
}

export function PrevalenceReport({ children, observations, campaignCode }: PrevalenceReportProps) {
  const [sortBy, setSortBy] = useState<'prevalence' | 'count' | 'name'>('prevalence')

  const report = useMemo(
    () => computePrevalenceReport(children, observations, campaignCode),
    [children, observations, campaignCode],
  )

  const sortedConditions = useMemo(() => {
    const conds = [...report.conditions]
    if (sortBy === 'prevalence') conds.sort((a, b) => b.prevalence - a.prevalence)
    else if (sortBy === 'count') conds.sort((a, b) => b.count - a.count)
    else conds.sort((a, b) => a.name.localeCompare(b.name))
    return conds
  }, [report, sortBy])

  function handleExport() {
    const csv = exportConditionsToCSV(report)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = generateReportFilename(campaignCode, 'csv')
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Category Overview */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Prevalence Report</h3>
            <p className="mt-1 text-xs text-gray-500">
              {report.totalScreened} children screened | Generated {new Date(report.generatedAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>

        {/* Category prevalence cards */}
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {report.categoryPrevalence.map(cat => (
            <div key={cat.category} className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{cat.prevalence.toFixed(1)}%</p>
              <p className="text-[10px] text-gray-500">{cat.label}</p>
              <p className="text-[10px] text-gray-400">{cat.childrenAffected} children</p>
            </div>
          ))}
        </div>
      </div>

      {/* Condition Detail Table */}
      {sortedConditions.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Condition Details</h3>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600"
            >
              <option value="prevalence">Sort by prevalence</option>
              <option value="count">Sort by count</option>
              <option value="name">Sort by name</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 text-left text-xs font-medium text-gray-500">Condition</th>
                  <th className="py-2 text-left text-xs font-medium text-gray-500">ICD-10</th>
                  <th className="py-2 text-left text-xs font-medium text-gray-500">Category</th>
                  <th className="py-2 text-right text-xs font-medium text-gray-500">Count</th>
                  <th className="py-2 text-right text-xs font-medium text-gray-500">Prevalence</th>
                  <th className="py-2 text-right text-xs font-medium text-gray-500">Severity</th>
                </tr>
              </thead>
              <tbody>
                {sortedConditions.map(cond => {
                  const sevEntries = Object.entries(cond.severityBreakdown).filter(([, v]) => v > 0)
                  return (
                    <tr key={cond.conditionId} className="border-b border-gray-100">
                      <td className="py-2 text-gray-800">{cond.name}</td>
                      <td className="py-2 text-xs text-gray-400 font-mono">{cond.icdCode || '—'}</td>
                      <td className="py-2 text-xs text-gray-500">{cond.category}</td>
                      <td className="py-2 text-right text-gray-600">{cond.count}</td>
                      <td className="py-2 text-right">
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                          cond.prevalence > 10 ? 'bg-red-100 text-red-700' :
                          cond.prevalence > 5 ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {cond.prevalence.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        {sevEntries.length > 0 ? (
                          <div className="flex justify-end gap-1">
                            {sevEntries.map(([sev, count]) => (
                              <span key={sev} className={`text-[9px] px-1 py-0.5 rounded ${
                                sev === 'severe' ? 'bg-red-100 text-red-700' :
                                sev === 'moderate' ? 'bg-amber-100 text-amber-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {sev}: {count}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sortedConditions.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">No conditions detected in this cohort.</p>
      )}
    </div>
  )
}

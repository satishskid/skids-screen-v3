/**
 * Executive Summary — Key population health metrics at a glance.
 * Shows top-line stats: screened, coverage, referral rate, normal rate, top conditions.
 */

import { Users, ShieldCheck, AlertTriangle, HeartPulse } from 'lucide-react'
import { StatsCard } from '../StatsCard'

interface ExecutiveSummaryProps {
  totalScreened: number
  totalEnrolled: number
  highRiskCount: number
  referralRate: number
  normalRate: number
  topConditions: Array<{ name: string; count: number; prevalence: number }>
}

export function ExecutiveSummary({
  totalScreened,
  totalEnrolled,
  highRiskCount,
  referralRate,
  normalRate,
  topConditions,
}: ExecutiveSummaryProps) {
  const coveragePct = totalEnrolled > 0 ? Math.round((totalScreened / totalEnrolled) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Children Screened"
          value={totalScreened}
          subtitle={`${coveragePct}% coverage`}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="High Risk Findings"
          value={highRiskCount}
          subtitle="Require follow-up"
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="Referral Rate"
          value={`${referralRate}%`}
          subtitle="Children referred"
          icon={HeartPulse}
          color="orange"
        />
        <StatsCard
          title="Normal Rate"
          value={`${normalRate}%`}
          subtitle="No findings"
          icon={ShieldCheck}
          color="green"
        />
      </div>

      {topConditions.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-800">Top Conditions</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {topConditions.slice(0, 6).map(cond => (
              <div key={cond.name} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="truncate text-sm text-gray-700">{cond.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">{cond.count}</span>
                  <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                    {cond.prevalence.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { BarChart3, TrendingUp, Activity, PieChart } from 'lucide-react'
import { StatsCard } from '../components/StatsCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useApi } from '../lib/hooks'
import { getModuleName, computeNurseQualityStats } from '@skids/shared'

interface CampaignRow {
  code: string
  name: string
  status: string
  totalChildren?: number
}

interface CampaignsResponse {
  campaigns: CampaignRow[]
}

export function AnalyticsPage() {
  const { data, isLoading } = useApi<CampaignsResponse>('/api/campaigns')

  const campaigns = data?.campaigns ?? []

  if (isLoading) {
    return <LoadingSpinner message="Loading analytics..." />
  }

  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length
  const completedCampaigns = campaigns.filter((c) => c.status === 'completed').length
  const totalChildren = campaigns.reduce(
    (sum, c) => sum + (c.totalChildren ?? 0),
    0,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Population health insights across all screening campaigns.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Campaigns"
          value={totalCampaigns}
          icon={BarChart3}
          color="blue"
        />
        <StatsCard
          title="Active"
          value={activeCampaigns}
          icon={Activity}
          color="green"
        />
        <StatsCard
          title="Completed"
          value={completedCampaigns}
          icon={TrendingUp}
          color="purple"
        />
        <StatsCard
          title="Total Children"
          value={totalChildren}
          icon={PieChart}
          color="orange"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-base font-semibold text-gray-900">
          Campaign Status Distribution
        </h3>
        <div className="mt-4 space-y-3">
          <StatusBar
            label="Active"
            count={activeCampaigns}
            total={totalCampaigns}
            color="bg-green-500"
          />
          <StatusBar
            label="Completed"
            count={completedCampaigns}
            total={totalCampaigns}
            color="bg-blue-500"
          />
          <StatusBar
            label="Archived"
            count={campaigns.filter((c) => c.status === 'archived').length}
            total={totalCampaigns}
            color="bg-gray-400"
          />
          <StatusBar
            label="Paused"
            count={campaigns.filter((c) => c.status === 'paused').length}
            total={totalCampaigns}
            color="bg-yellow-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-base font-semibold text-gray-900">
          Children per Campaign
        </h3>
        {campaigns.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">No campaign data.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {campaigns
              .sort((a, b) => (b.totalChildren ?? 0) - (a.totalChildren ?? 0))
              .slice(0, 10)
              .map((c) => (
                <div key={c.code} className="flex items-center justify-between">
                  <span className="truncate text-sm text-gray-700">
                    {c.name || c.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{
                          width: `${
                            totalChildren > 0
                              ? Math.min(
                                  100,
                                  ((c.totalChildren ?? 0) / totalChildren) * 100,
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-medium text-gray-500">
                      {c.totalChildren ?? 0}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-gray-600">{label}</span>
      <div className="flex-1">
        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-3 rounded-full ${color} transition-all`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="w-16 text-right text-xs font-medium text-gray-500">
        {count} ({pct}%)
      </span>
    </div>
  )
}

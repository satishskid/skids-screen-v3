import { useNavigate } from 'react-router-dom'
import {
  Megaphone,
  Users,
  ClipboardList,
  TrendingUp,
  Plus,
  BarChart3,
  ArrowRight,
  Calendar,
  MapPin,
} from 'lucide-react'
import { StatsCard } from '../components/StatsCard'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { useApi } from '../lib/hooks'
import { useAuth } from '../lib/auth'

interface CampaignRow {
  code: string
  name: string
  schoolName?: string
  status: string
  totalChildren?: number
  createdAt?: string
  city?: string
  location?: { city?: string; state?: string }
}

interface CampaignsResponse {
  campaigns: CampaignRow[]
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data, isLoading } = useApi<CampaignsResponse>('/api/campaigns')

  const campaigns = data?.campaigns ?? []
  const activeCampaigns = campaigns.filter((c) => c.status === 'active')
  const totalChildren = campaigns.reduce(
    (sum, c) => sum + (c.totalChildren ?? 0),
    0,
  )
  const recentCampaigns = [...campaigns]
    .sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return db - da
    })
    .slice(0, 5)

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name ?? 'Doctor'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here is an overview of your screening campaigns and activity.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Campaigns"
          value={campaigns.length}
          subtitle="All time"
          icon={Megaphone}
          color="blue"
        />
        <StatsCard
          title="Active Campaigns"
          value={activeCampaigns.length}
          subtitle="Currently running"
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Children Enrolled"
          value={totalChildren}
          subtitle="Across all campaigns"
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Campaigns Completed"
          value={campaigns.filter((c) => c.status === 'completed').length}
          subtitle="Successfully finished"
          icon={ClipboardList}
          color="orange"
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate('/campaigns')}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
        <button
          onClick={() => navigate('/analytics')}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <BarChart3 className="h-4 w-4" />
          View Analytics
        </button>
      </div>

      {/* Recent campaigns */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Campaigns
          </h3>
          {campaigns.length > 0 && (
            <button
              onClick={() => navigate('/campaigns')}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {recentCampaigns.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No campaigns yet"
            description="Create your first screening campaign to get started."
            action={{
              label: 'Create Campaign',
              onClick: () => navigate('/campaigns'),
            }}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {recentCampaigns.map((campaign) => (
              <button
                key={campaign.code}
                onClick={() => navigate(`/campaigns/${campaign.code}`)}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {campaign.name || campaign.schoolName || campaign.code}
                    </p>
                    <StatusBadge status={campaign.status} />
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {campaign.location?.city || campaign.city || 'No location'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {campaign.createdAt
                        ? new Date(campaign.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {campaign.totalChildren ?? 0} children
                    </span>
                  </div>
                </div>
                <div className="ml-4 font-mono text-xs text-gray-400">
                  {campaign.code}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

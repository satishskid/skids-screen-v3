import { User, Bell, Shield, Monitor } from 'lucide-react'
import { useAuth } from '../lib/auth'

export function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account and application preferences.
        </p>
      </div>

      {/* Profile Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Profile</h3>
            <p className="text-sm text-gray-500">Your account information</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Name
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {user?.name ?? 'Not set'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Email
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {user?.email ?? 'Not set'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Role
            </label>
            <p className="mt-1 text-sm text-gray-900">Doctor</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Account ID
            </label>
            <p className="mt-1 font-mono text-sm text-gray-500">
              {user?.id ?? '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <Monitor className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Preferences
            </h3>
            <p className="text-sm text-gray-500">
              Dashboard display settings
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Compact table view
              </p>
              <p className="text-xs text-gray-500">
                Show more data per page in tables
              </p>
            </div>
            <div className="h-5 w-9 rounded-full bg-gray-300" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Show risk highlights
              </p>
              <p className="text-xs text-gray-500">
                Highlight high-risk observations in red
              </p>
            </div>
            <div className="h-5 w-9 rounded-full bg-blue-600" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <Bell className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Notifications
            </h3>
            <p className="text-sm text-gray-500">
              Manage alert preferences
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                New screening alerts
              </p>
              <p className="text-xs text-gray-500">
                Notify when new screenings need review
              </p>
            </div>
            <div className="h-5 w-9 rounded-full bg-blue-600" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                High-risk alerts
              </p>
              <p className="text-xs text-gray-500">
                Immediate alerts for high-risk findings
              </p>
            </div>
            <div className="h-5 w-9 rounded-full bg-blue-600" />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Security
            </h3>
            <p className="text-sm text-gray-500">
              Authentication and security settings
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600">
            Authentication is managed via Better Auth. Password changes and
            two-factor authentication can be configured through your account
            provider.
          </p>
        </div>
      </div>

      {/* Version info */}
      <div className="rounded-lg bg-gray-50 p-4 text-center">
        <p className="text-xs text-gray-400">
          SKIDS Screen v3.0 &mdash; Doctor Dashboard
        </p>
        <p className="text-xs text-gray-400">
          API: skids-api.satish-9f4.workers.dev
        </p>
      </div>
    </div>
  )
}

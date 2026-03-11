import { useState } from 'react'
import { User, Monitor, Bell } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Switch, Badge } from '@/components/ui'

// ── Types & Persistence ────────────────────────────

const PREFS_KEY = 'skids-settings-prefs'
const NOTIF_KEY = 'skids-settings-notif'

interface Preferences {
  compactTable: boolean
  riskHighlights: boolean
}

interface NotifSettings {
  newScreeningAlerts: boolean
  highRiskAlerts: boolean
}

function loadPrefs(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { compactTable: false, riskHighlights: true }
}

function loadNotif(): NotifSettings {
  try {
    const raw = localStorage.getItem(NOTIF_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { newScreeningAlerts: true, highRiskAlerts: true }
}

const ROLE_STYLES: Record<string, { label: string; variant: 'default' | 'destructive' | 'success' | 'warning' | 'secondary' }> = {
  admin: { label: 'Administrator', variant: 'destructive' },
  ops_manager: { label: 'Operations Manager', variant: 'default' },
  doctor: { label: 'Doctor', variant: 'default' },
  nurse: { label: 'Nurse', variant: 'success' },
  authority: { label: 'Authority', variant: 'warning' },
}

// ── Component ──────────────────────────────────────

export function PreferencesTab() {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState<Preferences>(loadPrefs)
  const [notif, setNotif] = useState<NotifSettings>(loadNotif)
  const userRole = user?.role || 'nurse'
  const roleInfo = ROLE_STYLES[userRole] || { label: userRole, variant: 'secondary' as const }

  function handlePrefsChange(patch: Partial<Preferences>) {
    setPrefs((prev) => {
      const next = { ...prev, ...patch }
      localStorage.setItem(PREFS_KEY, JSON.stringify(next))
      return next
    })
  }

  function handleNotifChange(patch: Partial<NotifSettings>) {
    setNotif((prev) => {
      const next = { ...prev, ...patch }
      localStorage.setItem(NOTIF_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="space-y-6 mt-6">
      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Name</label>
              <p className="mt-1 text-sm font-medium text-foreground">{user?.name ?? 'Not set'}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Email</label>
              <p className="mt-1 text-sm font-medium text-foreground">{user?.email ?? 'Not set'}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Role</label>
              <div className="mt-1">
                <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Account ID</label>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{user?.id ?? '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <Monitor className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Dashboard display settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ToggleRow
              title="Compact table view"
              desc="Show more data per page in tables"
              checked={prefs.compactTable}
              onChange={(v) => handlePrefsChange({ compactTable: v })}
            />
            <ToggleRow
              title="Show risk highlights"
              desc="Highlight high-risk observations in red"
              checked={prefs.riskHighlights}
              onChange={(v) => handlePrefsChange({ riskHighlights: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <Bell className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage alert preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ToggleRow
              title="New screening alerts"
              desc="Notify when new screenings need review"
              checked={notif.newScreeningAlerts}
              onChange={(v) => handleNotifChange({ newScreeningAlerts: v })}
            />
            <ToggleRow
              title="High-risk alerts"
              desc="Immediate alerts for high-risk findings"
              checked={notif.highRiskAlerts}
              onChange={(v) => handleNotifChange({ highRiskAlerts: v })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────

function ToggleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  )
}

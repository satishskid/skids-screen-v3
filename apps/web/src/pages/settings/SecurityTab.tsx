import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Lock, Eye, EyeOff, Check, AlertCircle, Users, ArrowRight } from 'lucide-react'
import { apiCall } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input } from '@/components/ui'

interface SecurityTabProps {
  isAdmin: boolean
}

export function SecurityTab({ isAdmin }: SecurityTabProps) {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [changing, setChanging] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleChangePassword() {
    setMsg(null)
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }
    if (newPassword.length < 8) {
      setMsg({ type: 'error', text: 'New password must be at least 8 characters' })
      return
    }
    setChanging(true)
    try {
      await apiCall('/api/account/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      setMsg({ type: 'success', text: 'Password changed successfully' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowForm(false)
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Failed to change password'
      let errorText = raw
      try { const p = JSON.parse(raw); if (p.error) errorText = p.error } catch { /* use raw */ }
      setMsg({ type: 'error', text: errorText })
    } finally {
      setChanging(false)
    }
  }

  function resetForm() {
    setShowForm(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setMsg(null)
  }

  return (
    <div className="space-y-6 mt-6">
      {/* Admin: User Management Link */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <CardTitle>User Management</CardTitle>
                <CardDescription>Create users, manage PINs, reset passwords</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')}>
                Manage Users
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your account password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {msg && (
              <div
                className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                  msg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {msg.type === 'success' ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                {msg.text}
              </div>
            )}

            {!showForm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowForm(true); setMsg(null) }}
              >
                <Lock className="h-3.5 w-3.5" />
                Change Password
              </Button>
            ) : (
              <div className="space-y-3 max-w-md">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={handleChangePassword}
                    disabled={changing || !currentPassword || !newPassword || !confirmPassword}
                    size="sm"
                  >
                    {changing ? 'Changing...' : 'Update Password'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">
                Authentication powered by Better Auth with PBKDF2 password hashing (100k iterations).
                Sessions are managed via secure bearer tokens.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

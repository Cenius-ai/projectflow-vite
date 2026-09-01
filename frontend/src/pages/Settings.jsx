import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, Check, AlertCircle, User, Lock } from 'lucide-react'

export default function Settings() {
  const { user, updateUser } = useAuth()

  // Profile form
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [profileMsg, setProfileMsg] = useState(null)
  const [profileError, setProfileError] = useState(null)

  const profileMutation = useMutation({
    mutationFn: (body) => api.put('/users/me', body),
    onSuccess: (res) => {
      updateUser(res.data)
      setProfileMsg('Profile updated successfully.')
      setProfileError(null)
    },
    onError: (err) => {
      const detail = err?.response?.data?.detail
      setProfileError(typeof detail === 'string' ? detail : 'Failed to update profile.')
      setProfileMsg(null)
    },
  })

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    setProfileMsg(null)
    setProfileError(null)
    profileMutation.mutate({ name: name.trim(), email: email.trim() })
  }

  // Password form
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwdMsg, setPwdMsg] = useState(null)
  const [pwdError, setPwdError] = useState(null)

  const passwordMutation = useMutation({
    mutationFn: (body) => api.put('/users/me/password', body),
    onSuccess: () => {
      setPwdMsg('Password changed successfully.')
      setPwdError(null)
      setOldPassword('')
      setNewPassword('')
    },
    onError: (err) => {
      const detail = err?.response?.data?.detail
      setPwdError(typeof detail === 'string' ? detail : 'Failed to change password.')
      setPwdMsg(null)
    },
  })

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setPwdMsg(null)
    setPwdError(null)
    passwordMutation.mutate({ old_password: oldPassword, new_password: newPassword })
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-fg mb-1">Settings</h2>
      <p className="text-sm text-muted mb-8">Manage your profile and account security.</p>

      {/* Profile */}
      <div className="bg-surface-elevated rounded-card shadow-card border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-accent" />
          <h3 className="text-base font-semibold text-fg">Profile</h3>
        </div>

        {profileMsg && (
          <div className="flex items-center gap-2 text-sm text-success bg-success-muted rounded-lg px-3 py-2 mb-4">
            <Check className="w-4 h-4" />
            {profileMsg}
          </div>
        )}
        {profileError && (
          <div className="flex items-center gap-2 text-sm text-danger bg-danger-muted rounded-lg px-3 py-2 mb-4">
            <AlertCircle className="w-4 h-4" />
            {profileError}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-fg mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={profileMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {profileMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-surface-elevated rounded-card shadow-card border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-5 h-5 text-accent" />
          <h3 className="text-base font-semibold text-fg">Change Password</h3>
        </div>

        {pwdMsg && (
          <div className="flex items-center gap-2 text-sm text-success bg-success-muted rounded-lg px-3 py-2 mb-4">
            <Check className="w-4 h-4" />
            {pwdMsg}
          </div>
        )}
        {pwdError && (
          <div className="flex items-center gap-2 text-sm text-danger bg-danger-muted rounded-lg px-3 py-2 mb-4">
            <AlertCircle className="w-4 h-4" />
            {pwdError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-fg mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
            <p className="text-xs text-muted mt-1">Minimum 6 characters.</p>
          </div>
          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {passwordMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Change Password
          </button>
        </form>
      </div>
    </div>
  )
}

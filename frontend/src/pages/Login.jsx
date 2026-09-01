import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FolderKanban, Eye, EyeOff, AlertCircle } from 'lucide-react'

const DEMO_EMAIL = 'cenius@cenius.ai'
const DEMO_PASSWORD = 'cenius'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Login failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const fillDemo = () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent text-accent-fg mb-4">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-fg">ProjectFlow</h1>
          <p className="text-sm text-muted mt-1">Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div className="bg-surface-elevated rounded-card shadow-card border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 text-sm text-danger bg-danger-muted rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-fg mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-fg text-sm placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-fg mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-border bg-surface text-fg text-sm placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-fg p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-accent text-accent-fg font-medium text-sm hover:opacity-90 disabled:opacity-60 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-5 pt-4 border-t border-border">
            <p className="text-xs text-muted mb-2">Demo account credentials:</p>
            <div className="bg-accent-muted rounded-lg px-3 py-2 text-xs space-y-0.5">
              <div className="flex justify-between">
                <span className="text-muted">Email:</span>
                <span className="text-fg font-medium font-mono">{DEMO_EMAIL}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Password:</span>
                <span className="text-fg font-medium font-mono">{DEMO_PASSWORD}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="mt-2 w-full text-xs text-accent hover:underline"
            >
              Fill demo credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

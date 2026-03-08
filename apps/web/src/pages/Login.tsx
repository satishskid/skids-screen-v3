import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Heart, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'

export function LoginPage() {
  const { isAuthenticated, signIn, signUp, isLoading, error, clearError } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const displayError = localError || error

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLocalError(null)
    clearError()

    if (!email || !password) {
      setLocalError('Please fill in all required fields.')
      return
    }

    if (isSignUp && !name) {
      setLocalError('Please enter your name.')
      return
    }

    try {
      if (isSignUp) {
        await signUp(name, email, password)
      } else {
        await signIn(email, password)
      }
    } catch {
      // Error is handled by auth context
    }
  }

  function toggleMode() {
    setIsSignUp(!isSignUp)
    setLocalError(null)
    clearError()
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="hidden w-1/2 flex-col justify-between bg-blue-600 p-12 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black text-white">SKIDS</span>
              <span className="ml-1 text-2xl font-light text-white/60">screen</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-blue-200">
            Pediatric Health Screening Platform
          </p>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Comprehensive pediatric screening for every child.
          </h1>
          <p className="text-lg text-blue-200">
            30+ screening modules. AI-powered analysis. 4D health reports.
            Built for doctors, nurses, and school health teams.
          </p>
          <div className="flex gap-4">
            <div className="rounded-lg bg-white/10 px-4 py-3">
              <p className="text-2xl font-bold text-white">30+</p>
              <p className="text-xs text-blue-200">Modules</p>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-3">
              <p className="text-2xl font-bold text-white">4D</p>
              <p className="text-xs text-blue-200">Reports</p>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-3">
              <p className="text-2xl font-bold text-white">AI</p>
              <p className="text-xs text-blue-200">Analysis</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-blue-300">
          Version 3.0 &mdash; Doctor Dashboard
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900">SKIDS</span>
            <span className="text-xl font-light text-gray-400">screen</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isSignUp
              ? 'Sign up to access the screening dashboard.'
              : 'Sign in to your doctor dashboard.'}
          </p>

          {displayError && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isSignUp && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Dr. Jane Smith"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="doctor@hospital.org"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={toggleMode}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

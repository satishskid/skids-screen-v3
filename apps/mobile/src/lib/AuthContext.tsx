// Authentication context for SKIDS Screen V3
// Uses React Context with simple token state (no expo-secure-store for now)
// Calls Better Auth endpoints on the API server

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { API_BASE } from './api'

interface AuthUser {
  id: string
  name: string
  email: string
  role?: string
  image?: string | null
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = !!user && !!token

  // Try to fetch the current session on mount (in case we have a stored token)
  useEffect(() => {
    // No persisted token for now — user must log in each session
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(
          (errorData as Record<string, string>).message || `Login failed (${res.status})`
        )
      }

      const data = await res.json()

      // Better Auth returns { user, session } or { token, user }
      const authUser: AuthUser = {
        id: data.user?.id || data.id || '',
        name: data.user?.name || data.name || '',
        email: data.user?.email || data.email || email,
        role: data.user?.role || data.role,
        image: data.user?.image || data.image || null,
      }

      const authToken =
        data.session?.token ||
        data.token ||
        data.session?.id ||
        res.headers.get('set-auth-token') ||
        ''

      setUser(authUser)
      setToken(authToken)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      setIsLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(
            (errorData as Record<string, string>).message || `Signup failed (${res.status})`
          )
        }

        const data = await res.json()

        const authUser: AuthUser = {
          id: data.user?.id || data.id || '',
          name: data.user?.name || data.name || name,
          email: data.user?.email || data.email || email,
          role: data.user?.role || data.role || 'nurse',
          image: data.user?.image || data.image || null,
        }

        const authToken =
          data.session?.token ||
          data.token ||
          data.session?.id ||
          res.headers.get('set-auth-token') ||
          ''

        setUser(authUser)
        setToken(authToken)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAuthenticated, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

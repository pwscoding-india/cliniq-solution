'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'
import { authApi, User } from '@/lib/api'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isPending: boolean
  isBlocked: boolean
  needsRegistration: boolean
  error: string | null
  isDemo: boolean
  startDemo: (role: 'doctor' | 'assistant') => Promise<User>
  exitDemo: () => void
  refetch: () => Promise<void>
}

const DEMO_FLAG = 'clinic_demo'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, setIsPending] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [needsRegistration, setNeedsRegistration] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  const clearDemo = () => {
    localStorage.removeItem(DEMO_FLAG)
    localStorage.removeItem('clinic_token')
    setIsDemo(false)
  }

  // Demo sessions have no Clerk user; restore them from the stored demo JWT
  const restoreDemo = async () => {
    const storedToken = localStorage.getItem('clinic_token')
    if (localStorage.getItem(DEMO_FLAG) !== '1' || !storedToken) return false
    try {
      const response = await authApi.me(storedToken)
      setUser(response.user)
      setToken(storedToken)
      setIsDemo(true)
      return true
    } catch {
      clearDemo()
      return false
    }
  }

  const verifyUser = async () => {
    if (!clerkUser) {
      setIsPending(false)
      setIsBlocked(false)
      setNeedsRegistration(false)
      if (!(await restoreDemo())) {
        setUser(null)
        setToken(null)
      }
      setIsLoading(false)
      return
    }

    // A real sign-in always replaces any demo session
    if (localStorage.getItem(DEMO_FLAG) === '1') clearDemo()

    setIsLoading(true)
    setError(null)

    try {
      const response = await authApi.verify(
        clerkUser.id,
        clerkUser.primaryEmailAddress?.emailAddress,
        clerkUser.fullName || clerkUser.firstName || 'User'
      )

      setUser(response.user)
      setToken(response.token)
      setIsPending(false)
      setIsBlocked(false)
      setNeedsRegistration(false)

      // Store token in localStorage
      localStorage.setItem('clinic_token', response.token)
    } catch (err: unknown) {
      const error = err as { status?: number; code?: string; message?: string }
      if (error.status === 404 || error.code === 'NOT_FOUND') {
        setNeedsRegistration(true)
        setUser(null)
        setToken(null)
      } else if (error.status === 403) {
        if (error.code === 'PENDING_APPROVAL') {
          setIsPending(true)
        } else if (error.code === 'BLOCKED') {
          setIsBlocked(true)
        }
        setUser(null)
        setToken(null)
      } else {
        setError(error.message || 'Authentication failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (clerkLoaded) {
      verifyUser()
    }
  }, [clerkLoaded, clerkUser?.id])

  // Check for stored token on mount (with SSR safety check)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedToken = localStorage.getItem('clinic_token')
    if (storedToken && !token) {
      setToken(storedToken)
    }
  }, [token])

  const startDemo = async (role: 'doctor' | 'assistant') => {
    const response = await authApi.demo(role)
    localStorage.setItem('clinic_token', response.token)
    localStorage.setItem(DEMO_FLAG, '1')
    setUser(response.user)
    setToken(response.token)
    setIsDemo(true)
    setIsPending(false)
    setIsBlocked(false)
    setNeedsRegistration(false)
    return response.user
  }

  // Only clear storage, then do a full page load to /demo: changing state in
  // place would let protected pages redirect to Clerk sign-in first
  const exitDemo = () => {
    localStorage.removeItem(DEMO_FLAG)
    localStorage.removeItem('clinic_token')
    window.location.assign('/demo')
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading: !clerkLoaded || isLoading,
    isAuthenticated: !!user && !!token && user.status === 'approved',
    isPending,
    isBlocked,
    needsRegistration,
    error,
    isDemo,
    startDemo,
    exitDemo,
    refetch: verifyUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

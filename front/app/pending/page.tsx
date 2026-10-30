'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { useAuth } from '@/context/AuthContext'
import { Clock, RefreshCw, LogOut, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function PendingPage() {
  const router = useRouter()
  const { isAuthenticated, isPending, refetch, isLoading } = useAuth()
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleCheckStatus = async () => {
    setChecking(true)
    try {
      await refetch()
      if (isAuthenticated) {
        toast.success('Your account has been approved!')
        router.push('/')
      } else if (isPending) {
        toast.info('Your account is still pending approval')
      }
    } catch (error) {
      toast.error('Failed to check status')
    } finally {
      setChecking(false)
    }
  }

  // Show loading state while auth context is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is not pending anymore but also not authenticated, show message
  if (!isPending && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg border shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Registration Required
          </h1>

          <p className="text-gray-600 mb-6">
            You need to complete the registration process to access this page.
          </p>

          <div className="space-y-3">
            <Button
              className="w-full bg-gray-900 hover:bg-gray-800"
              onClick={() => router.push('/join')}
            >
              Complete Registration
            </Button>

            <SignOutButton>
              <Button variant="outline" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </SignOutButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg border shadow-sm p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
          <Clock className="h-8 w-8 text-amber-600" />
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Account Pending Approval
        </h1>

        <p className="text-gray-600 mb-6">
          Your registration request has been submitted. An administrator will review and approve your account shortly.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            You&apos;ll be able to access your dashboard once your account is approved.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCheckStatus}
            disabled={checking}
          >
            {checking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Status
              </>
            )}
          </Button>

          <SignOutButton>
            <Button variant="ghost" className="w-full text-gray-500">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  )
}

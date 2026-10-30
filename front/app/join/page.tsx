'use client'

import { useUser, SignOutButton } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, UserPlus, LogOut, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function JoinPage() {
  const { user: clerkUser } = useUser()
  const router = useRouter()
  const { isAuthenticated, isPending, refetch } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'doctor' as 'doctor' | 'assistant'
  })
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; phone?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isValidEmail = (value: string) => {
    const v = value.trim()
    if (!v) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  }

  const normalizeIndianMobile = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('91') && digits.length === 12) return digits.slice(2)
    if (digits.startsWith('0') && digits.length === 11) return digits.slice(1)
    return digits
  }

  const isValidIndianMobile = (raw: string) => {
    if (!raw) return true
    const digits = normalizeIndianMobile(raw)
    return /^[6-9]\d{9}$/.test(digits)
  }

  const validateForm = () => {
    const errors: { name?: string; email?: string; phone?: string } = {}

    if (!formData.name.trim()) {
      errors.name = 'Full name is required'
    }

    if (!isValidEmail(formData.email)) {
      errors.email = 'Enter a valid email address'
    }

    if (formData.phone && !isValidIndianMobile(formData.phone)) {
      errors.phone = 'Enter a valid Indian mobile number'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  useEffect(() => {
    if (clerkUser) {
      setFormData(prev => ({
        ...prev,
        name: clerkUser.fullName || clerkUser.firstName || '',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        phone: clerkUser.primaryPhoneNumber?.phoneNumber || '',
      }))
    }
  }, [clerkUser])

  const canSubmit =
    !!formData.name.trim() &&
    isValidEmail(formData.email) &&
    !isSubmitting

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    } else if (isPending) {
      router.push('/pending')
    }
  }, [isAuthenticated, isPending, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'name' && formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }))
    if (name === 'email' && formErrors.email) setFormErrors(prev => ({ ...prev, email: undefined }))
    if (name === 'phone' && formErrors.phone) setFormErrors(prev => ({ ...prev, phone: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clerkUser) return

    const isValid = validateForm()
    if (!isValid) {
      toast.error('Please fix the highlighted fields')
      return
    }

    setIsSubmitting(true)

    try {
      await authApi.register({
        clerkId: clerkUser.id,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        role: formData.role
      })

      setSubmitted(true)
      toast.success('Registration submitted successfully')

      await refetch()
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string }
      if (err.code === 'CONFLICT') {
        toast.error('You have already submitted a registration request')
        setSubmitted(true)
      } else {
        toast.error(err.message || 'Registration failed')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg border p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Registration Submitted
          </h1>

          <p className="text-gray-600 mb-6">
            Your request has been submitted. An administrator will review and approve your account shortly.
          </p>

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => router.push('/pending')}
            >
              Check Status
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
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg border shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Join Cliniq</h1>
            <p className="text-gray-600 mt-1">
              Complete your registration
            </p>
          </div>

          {/* Role Selection */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'doctor' }))}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-md text-sm font-medium border transition-colors',
                formData.role === 'doctor'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              )}
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'assistant' }))}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-md text-sm font-medium border transition-colors',
                formData.role === 'assistant'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              )}
            >
              Assistant
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                aria-invalid={!!formErrors.name}
                aria-describedby={formErrors.name ? 'join-name-error' : undefined}
                className={cn(
                  'mt-1 h-11',
                  formErrors.name && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              {formErrors.name && (
                <p id="join-name-error" className="text-sm text-red-600 mt-1">
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                readOnly
                aria-describedby="join-email-hint"
                className="mt-1 h-11 bg-gray-50 cursor-not-allowed"
              />
              <p id="join-email-hint" className="text-xs text-gray-500 mt-1">
                From your Clerk account
              </p>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit Indian mobile"
                inputMode="numeric"
                aria-invalid={!!formErrors.phone}
                aria-describedby={formErrors.phone ? 'join-phone-error' : undefined}
                className={cn(
                  'mt-1 h-11',
                  formErrors.phone && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              {formErrors.phone && (
                <p id="join-phone-error" className="text-sm text-red-600 mt-1">
                  {formErrors.phone}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                'w-full h-11 mt-2',
                canSubmit
                  ? 'bg-gray-900 hover:bg-gray-800 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Submit Registration
                </>
              )}
            </Button>
          </form>

          {/* Sign Out */}
          <div className="mt-6 pt-4 border-t text-center">
            <SignOutButton>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Sign out and use a different account
              </button>
            </SignOutButton>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-4">
          Approval usually takes 1-2 business days
        </p>
      </div>
    </div>
  )
}

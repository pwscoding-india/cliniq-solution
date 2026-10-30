'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { useAuth } from '@/context/AuthContext'
import { Loader2, Sparkles, Zap, Play, Clock, Shield, ArrowRight, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { motion } from 'framer-motion'

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, isPending, isBlocked, needsRegistration } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated && user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin')
          break
        case 'doctor':
          router.push('/doctor')
          break
        case 'assistant':
          router.push('/assistant')
          break
        default:
          break
      }
    } else if (isPending) {
      router.push('/pending')
    } else if (isBlocked) {
      router.push('/blocked')
    } else if (needsRegistration) {
      router.push('/join')
    }
  }, [isLoading, isAuthenticated, isPending, isBlocked, needsRegistration, user, router])

  const features = [
    {
      icon: Activity,
      title: "Real-time Updates",
      description: "Live queue status with instant notifications",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: Clock,
      title: "Zero Wait Chaos",
      description: "Streamlined patient flow management",
      gradient: "from-teal-500 to-emerald-600"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for your clinic",
      gradient: "from-purple-500 to-pink-600"
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/50">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-60 animate-float" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200 to-emerald-200 rounded-full blur-3xl opacity-50 animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full blur-3xl opacity-40 animate-float" style={{ animationDelay: '-6s' }} />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <SignedOut>
        <div className="relative min-h-screen flex flex-col">
          {/* Header */}
          <header className="w-full py-5 px-6 sm:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Cliniq
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm" className="gap-2">
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </SignInButton>
              </motion.div>
            </div>
          </header>

          {/* Hero Section */}
          <main className="flex-1 flex items-center justify-center px-6 py-12 sm:py-20">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
                <span className="text-sm font-medium text-indigo-700">
                  Trusted by 500+ Clinics
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Manage Your Clinic
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Queue Effortlessly
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Real-time queue management system that reduces patient wait times
                and streamlines your clinic operations.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <SignInButton mode="modal">
                  <Button size="xl" className="group gap-3 px-8">
                    <Zap className="h-5 w-5" />
                    Get Started Free
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </SignInButton>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="gap-2">
                      <Play className="h-5 w-5" />
                      Watch Demo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-black border-0 [&>button]:z-10 [&>button]:text-white [&>button]:opacity-90">
                    <DialogTitle className="sr-only">Cliniq demo video</DialogTitle>
                    <video
                      src="/demo/cliniq-demo.mp4"
                      poster="/demo/cliniq-demo-poster.jpg"
                      className="w-full aspect-video"
                      controls
                      autoPlay
                      playsInline
                      preload="none"
                    />
                  </DialogContent>
                </Dialog>
              </motion.div>

              {/* Feature Cards */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  >
                    {/* Gradient bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`} />

                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative">
                      <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg mb-4`}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </main>

          {/* Footer */}
          <footer className="py-6 px-6 text-center">
            <p className="text-sm text-gray-500">
              © 2026 Cliniq. All rights reserved.
            </p>
          </footer>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="relative min-h-screen flex items-center justify-center">
          <motion.div
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-2xl opacity-30 animate-pulse" />
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">Loading your dashboard</p>
              <p className="text-sm text-gray-500 mt-1">Please wait...</p>
            </div>
          </motion.div>
        </div>
      </SignedIn>
    </div>
  )
}

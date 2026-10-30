'use client'

import { Fragment, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/nextjs'
import { useAuth } from '@/context/AuthContext'
import { Loader2, LayoutDashboard, Users, Building2, FileText, Menu, X, UserCheck, Sparkles, LogOut, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated, isPending, isBlocked, needsRegistration, isDemo, exitDemo } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Demo sessions have no Clerk user, so they skip the Clerk sign-in gate
  const SignedInGate = isDemo ? Fragment : SignedIn

  const exitDemoButton = (
    <button
      type="button"
      onClick={exitDemo}
      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 hover:opacity-90 transition-opacity"
    >
      <LogOut className="h-4 w-4" />
      Exit demo
    </button>
  )

  useEffect(() => {
    if (isLoading) return

    if (isPending) {
      router.push('/pending')
    } else if (isBlocked) {
      router.push('/blocked')
    } else if (needsRegistration) {
      router.push('/join')
    }
  }, [isLoading, isPending, isBlocked, needsRegistration, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-xl opacity-30 animate-pulse" />
            <Loader2 className="relative h-10 w-10 animate-spin text-indigo-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    ...(user?.role === 'admin' ? [
      { href: '/admin', label: 'Users', icon: Users },
      { href: '/admin/clinics', label: 'Clinics', icon: Building2 },
    ] : []),
    ...(user?.role === 'doctor' ? [
      { href: '/doctor', label: 'Queue', icon: LayoutDashboard },
      { href: '/doctor/assistants', label: 'Assistants', icon: UserCheck },
      { href: '/reports', label: 'Reports', icon: FileText },
    ] : []),
    ...(user?.role === 'assistant' ? [
      { href: '/assistant', label: 'Queue', icon: LayoutDashboard },
      { href: '/assistant/patients', label: 'Patients', icon: Users },
      { href: '/reports', label: 'Reports', icon: FileText },
    ] : []),
  ]

  return (
    <>
      {!isDemo && (
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      )}
      <SignedInGate>
        {isAuthenticated ? (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-50" />
              <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full blur-3xl opacity-40" />
              <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full blur-3xl opacity-30" />
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-50 md:hidden">
                <button
                  type="button"
                  aria-label="Close menu"
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <div className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl shadow-2xl border-l border-gray-100">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <span className="text-base font-semibold text-white">Menu</span>
                    <button
                      type="button"
                      aria-label="Close menu"
                      className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>

                  {/* Mobile Menu Content */}
                  <div className="px-4 py-5">
                    {/* User Info Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 mb-4 border border-gray-100">
                      <p className="font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500 capitalize flex items-center gap-1.5 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {user?.role}
                      </p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                            pathname === item.href
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                              : 'text-gray-700 hover:bg-gray-100'
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      ))}
                    </nav>

                    {/* Sign Out */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      {isDemo ? (
                        <div className="px-2">{exitDemoButton}</div>
                      ) : (
                        <div className="flex items-center gap-3 px-2">
                          <UserButton afterSignOutUrl="/" />
                          <span className="text-sm text-gray-500">Sign out</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Premium Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/80 sticky top-0 z-40 shadow-sm shadow-gray-100/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  {/* Logo & Nav */}
                  <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2.5 group">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-xl group-hover:shadow-indigo-500/30 transition-all duration-300 group-hover:scale-105">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Cliniq
                      </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                            pathname === item.href
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                  </div>

                  {/* Right Side */}
                  <div className="flex items-center gap-3">
                    {/* Mobile Menu Button */}
                    <button
                      type="button"
                      aria-label="Open menu"
                      className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                      onClick={() => setIsMobileMenuOpen(true)}
                    >
                      <Menu className="h-5 w-5 text-gray-700" />
                    </button>

                    {/* User Info (Desktop) */}
                    <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-gray-50/80 border border-gray-100">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize flex items-center justify-end gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {user?.role}
                        </p>
                      </div>
                      {isDemo ? exitDemoButton : (
                        <UserButton
                          afterSignOutUrl="/"
                          appearance={{
                            elements: {
                              avatarBox: 'h-9 w-9 ring-2 ring-white shadow-md'
                            }
                          }}
                        />
                      )}
                    </div>

                    {/* Mobile User Button */}
                    <div className="sm:hidden">
                      {isDemo ? exitDemoButton : <UserButton afterSignOutUrl="/" />}
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {isDemo && (
              <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm">
                  <PlayCircle className="h-4 w-4 shrink-0" />
                  <span>
                    Demo mode: you are viewing a sample clinic as the <b className="capitalize">{user?.role}</b>. Feel free to click around.
                  </span>
                  <button type="button" onClick={exitDemo} className="underline underline-offset-2 font-semibold ml-1 hover:opacity-80">
                    Switch role
                  </button>
                </div>
              </div>
            )}

            {/* Main content */}
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {children}
            </main>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-xl opacity-30 animate-pulse" />
                <Loader2 className="relative h-10 w-10 animate-spin text-indigo-600" />
              </div>
            </div>
          </div>
        )}
      </SignedInGate>
    </>
  )
}

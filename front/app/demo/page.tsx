'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ClipboardList, Stethoscope, Smartphone, ArrowRight, Loader2, Play } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/lib/api'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

type Choice = 'assistant' | 'doctor' | 'patient'

const choices: { id: Choice; title: string; who: string; description: string; points: string[]; icon: typeof ClipboardList; gradient: string }[] = [
  {
    id: 'assistant',
    title: 'Front Desk',
    who: 'Assistant view',
    description: 'Add walk-in patients, find repeat patients by phone and manage the live queue.',
    points: ['Add patient in seconds', 'Emergency priority', 'Skip / No-show'],
    icon: ClipboardList,
    gradient: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'doctor',
    title: 'Doctor',
    who: 'Doctor view',
    description: 'Call the next patient, start and complete consultations, write prescriptions.',
    points: ['Call Next → Start → Complete', 'Prescription + WhatsApp', 'Daily reports'],
    icon: Stethoscope,
    gradient: 'from-teal-500 to-emerald-600'
  },
  {
    id: 'patient',
    title: 'Patient',
    who: 'Live token on phone',
    description: 'What your patients see: their token, position and estimated wait, updating live.',
    points: ['No app needed', 'Live position', 'Estimated wait time'],
    icon: Smartphone,
    gradient: 'from-pink-500 to-rose-600'
  }
]

export default function DemoPage() {
  const router = useRouter()
  const { startDemo } = useAuth()
  const [loading, setLoading] = useState<Choice | null>(null)
  const [error, setError] = useState<string | null>(null)

  const open = async (choice: Choice) => {
    setLoading(choice)
    setError(null)
    try {
      if (choice === 'patient') {
        const { tokenId } = await authApi.demoPatientToken()
        if (!tokenId) throw new Error('No live token available right now')
        router.push(`/q/${tokenId}`)
        return
      }
      await startDemo(choice)
      router.push(choice === 'doctor' ? '/doctor' : '/assistant')
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e.message || 'Could not start the demo. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/50">
      <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-60 animate-float" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200 to-emerald-200 rounded-full blur-3xl opacity-50 animate-float" style={{ animationDelay: '-3s' }} />

      <div className="relative max-w-6xl mx-auto px-6 py-8 sm:py-12">
        <header className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Cliniq</span>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white/80 text-sm font-medium text-gray-700 hover:bg-white">
                <Play className="h-4 w-4" />
                Watch video
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-black border-0 [&>button]:z-10 [&>button]:text-white [&>button]:opacity-90">
              <DialogTitle className="sr-only">Cliniq demo video</DialogTitle>
              <video src="/demo/cliniq-demo.mp4" poster="/demo/cliniq-demo-poster.jpg" className="w-full aspect-video" controls autoPlay playsInline preload="none" />
            </DialogContent>
          </Dialog>
        </header>

        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            <span className="text-sm font-medium text-indigo-700">Live demo · Sunrise Family Clinic</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Try Cliniq <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">in one click</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            No signup, no OTP. Pick a role and explore a sample clinic with real-looking patients and a live queue.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {choices.map((c, i) => (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => open(c.id)}
              disabled={loading !== null}
              className="group relative text-left overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60 disabled:opacity-70 disabled:hover:translate-y-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.gradient}`} />
              <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${c.gradient} text-white shadow-lg mb-4`}>
                <c.icon className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{c.who}</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{c.title}</h2>
              <p className="text-sm text-gray-600 mb-4">{c.description}</p>
              <ul className="space-y-1.5 mb-6">
                {c.points.map((p) => (
                  <li key={p} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {p}
                  </li>
                ))}
              </ul>
              <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${c.gradient} text-white text-sm font-semibold shadow-md`}>
                {loading === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading === c.id ? 'Opening…' : `Open ${c.title} demo`}
                {loading !== c.id && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </span>
            </motion.button>
          ))}
        </div>

        {error && <p className="mt-6 text-center text-sm text-red-600">{error}</p>}

        <p className="mt-10 text-center text-sm text-gray-500">
          Tip: open the Front Desk and Doctor demos in two tabs, and watch the queue update live in both.
        </p>
      </div>
    </div>
  )
}

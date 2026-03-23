"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/error-message"

// ─── Types ─────────────────────────────────────────────────────────────────────
// Matches GET /api/eco → { treesPlanted, orders, ecoScore }

interface EcoApiResponse {
  treesPlanted: number
  orders: number
  ecoScore: number
}

interface EcoCounterProps {
  className?: string
}

// ─── Animated Count Hook ───────────────────────────────────────────────────────

function useCountUp(target: number, duration = 2000, enabled: boolean) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled || target === 0) return
    const startTime = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(Math.floor(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
      else setValue(target)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration, enabled])

  return value
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: number
  suffix: string
  icon: React.ReactNode
  glowColor: string
  delay: number
  enabled: boolean
}

function StatCard({ label, value, suffix, icon, glowColor, delay, enabled }: StatCardProps) {
  const [mounted, setMounted] = useState(false)
  const count = useCountUp(value, 2000, mounted && enabled)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "border border-white/10 bg-white/5 backdrop-blur-xl",
        "transition-all duration-700",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Ambient glow blob */}
      <div
        className={cn(
          "absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl opacity-20 pointer-events-none",
          glowColor
        )}
      />
      {/* Bottom shimmer line */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Icon */}
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/8 backdrop-blur-sm">
        {icon}
      </div>

      {/* Number */}
      <div className="flex items-end gap-1.5">
        <span className="font-['Syne'] text-[2.5rem] font-bold leading-none tracking-tight text-white">
          {count.toLocaleString("en-IN")}
        </span>
        <span className="mb-1 text-xs font-medium text-white/40">{suffix}</span>
      </div>

      {/* Label */}
      <p className="mt-2 text-sm font-medium text-white/50">{label}</p>
    </div>
  )
}

// ─── EcoCounter ────────────────────────────────────────────────────────────────

export function EcoCounter({ className }: EcoCounterProps) {
  const [data, setData] = useState<EcoApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inView, setInView] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/eco")
        if (res.status === 401) throw new Error("Please log in to view your eco stats.")
        if (!res.ok) throw new Error("Failed to load eco stats.")
        setData(await res.json())
      } catch (error: unknown) {
        setError(getErrorMessage(error, "Something went wrong."))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Start count animation on scroll into view
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.25 }
    )
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  const cards: StatCardProps[] = [
    {
      label: "Trees Planted",
      value: data?.treesPlanted ?? 0,
      suffix: "trees",
      glowColor: "bg-emerald-500",
      delay: 0,
      enabled: inView,
      icon: (
        <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 22V12m0 0C12 7 7 4 3 6c0 5 4 8 9 9m0-9c0-5 5-8 9-6-1 5-4 8-9 9" />
        </svg>
      ),
    },
    {
      label: "Orders Placed",
      value: data?.orders ?? 0,
      suffix: "orders",
      glowColor: "bg-sky-500",
      delay: 110,
      enabled: inView,
      icon: (
        <svg className="h-5 w-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      label: "Eco Score",
      value: data?.ecoScore ?? 0,
      suffix: "pts",
      glowColor: "bg-violet-500",
      delay: 220,
      enabled: inView,
      icon: (
        <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
  ]

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Your Impact
        </p>
        <h2 className="font-['Syne'] text-2xl font-bold text-white">Eco Dashboard</h2>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      )}

      {!loading && !error && data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      )}
    </div>
  )
}
